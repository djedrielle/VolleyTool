import { describe, it, expect } from 'vitest';
import {
  ProyeccionService,
  type AccionLectura,
  type SetLectura,
  type AgregadosEscritura,
  type ClasificacionEscritura,
} from './proyeccion.service.js';
import type { Accion } from '../dominio/accion.js';
import type { SetPartido } from '../dominio/set-partido.js';
import type { CoreClient, PartidoDeCore } from '../core-client.js';
import type { FilaClasificacion } from '../dominio/clasificacion.js';
import type {
  MetricasJugadorPartido,
  MetricasEquipoPartido,
  MetricasRotacion,
} from '../dominio/metricas.js';

function acc(over: Partial<Accion>): Accion {
  return {
    id: 'a',
    setId: 's1',
    equipoId: 'e1',
    jugadorId: 'j1',
    rally: 1,
    ordenEnRally: 1,
    rotacion: 1,
    tipo: 'ataque',
    resultado: 'punto_directo',
    puntoParaEquipoId: null,
    corrigeAccionId: null,
    registradoEn: new Date(),
    registradoPor: null,
    ...over,
  };
}

interface Escrito {
  jugadores: MetricasJugadorPartido[];
  equipos: MetricasEquipoPartido[];
  rotaciones: MetricasRotacion[];
}

const PARTIDOS: PartidoDeCore[] = [
  { id: 'p1', torneoId: 't1', equipoCasaId: 'e1', equipoVisitaId: 'e2' },
];

const SET_ABIERTO: SetPartido = {
  id: 's1',
  partidoId: 'p1',
  numero: 1,
  puntosCasa: 0,
  puntosVisita: 0,
  cerrado: false,
};

function montar(acciones: Accion[], sets: SetPartido[] = [SET_ABIERTO]) {
  const setRepo: SetLectura = {
    listarPorPartido: async (id) => sets.filter((s) => s.partidoId === id),
  };
  const accionRepo: AccionLectura = {
    listarPorSet: async (id) => acciones.filter((a) => a.setId === id),
  };
  let escrito: Escrito | null = null;
  const agregados: AgregadosEscritura = {
    reemplazarDePartido: async (_partidoId, datos) => {
      escrito = datos;
    },
  };
  let tabla: FilaClasificacion[] = [];
  const clasificacion: ClasificacionEscritura = {
    reemplazarDeTorneo: async (_torneoId, filas) => {
      tabla = filas;
    },
  };
  const core: CoreClient = {
    obtenerPartido: async (id) => PARTIDOS.find((p) => p.id === id) ?? null,
    partidosDeTorneo: async (torneoId) => PARTIDOS.filter((p) => p.torneoId === torneoId),
  };

  const svc = new ProyeccionService(accionRepo, setRepo, agregados, clasificacion, core);
  return {
    svc,
    obtenerEscrito: () => escrito as Escrito | null,
    obtenerTabla: () => tabla,
  };
}

describe('ProyeccionService', () => {
  it('proyecta los agregados por jugador, equipo y rotación', async () => {
    const { svc, obtenerEscrito } = montar([
      acc({ id: 'a1', jugadorId: 'j1', equipoId: 'e1', rotacion: 1, tipo: 'ataque', resultado: 'punto_directo', puntoParaEquipoId: 'e1' }),
      acc({ id: 'a2', jugadorId: 'j1', equipoId: 'e1', rotacion: 1, tipo: 'ataque', resultado: 'error' }),
      acc({ id: 'a3', jugadorId: 'j2', equipoId: 'e2', rotacion: 3, tipo: 'saque', resultado: 'ace', puntoParaEquipoId: 'e2' }),
    ]);

    const resumen = await svc.proyectarPartido('p1');
    expect(resumen).toEqual({ jugadores: 2, equipos: 2, rotaciones: 12, clasificacion: 2 });

    const escrito = obtenerEscrito()!;
    const j1 = escrito.jugadores.find((x) => x.jugadorId === 'j1')!;
    expect(j1.ataquesTotales).toBe(2);
    expect(j1.ataquesPuntoDirecto).toBe(1);
    expect(j1.ataquesErrados).toBe(1);
    expect(j1.setsJugados).toBe(1);

    const e1r1 = escrito.rotaciones.find((x) => x.equipoId === 'e1' && x.rotacion === 1)!;
    expect(e1r1.ataques).toBe(2);
    expect(e1r1.puntosDirectos).toBe(1);
    expect(e1r1.puntosTotales).toBe(1);
  });

  it('ignora la acción anulada por un deshacer', async () => {
    const { svc, obtenerEscrito } = montar([
      acc({ id: 'a1', jugadorId: 'j1', equipoId: 'e1', rally: 1, tipo: 'ataque', resultado: 'punto_directo' }),
      // anula a1 (deshacer): ni a1 ni a2 cuentan
      acc({ id: 'a2', jugadorId: 'j1', equipoId: 'e1', rally: 1, tipo: 'ataque', resultado: 'punto_directo', corrigeAccionId: 'a1' }),
      // acción vigente posterior
      acc({ id: 'a3', jugadorId: 'j1', equipoId: 'e1', rally: 2, tipo: 'ataque', resultado: 'error' }),
    ]);

    await svc.proyectarPartido('p1');
    const j1 = obtenerEscrito()!.jugadores.find((x) => x.jugadorId === 'j1')!;
    expect(j1.ataquesTotales).toBe(1);
    expect(j1.ataquesErrados).toBe(1);
    expect(j1.ataquesPuntoDirecto).toBe(0);
  });

  it('recalcula la tabla del torneo en cascada al proyectar el partido', async () => {
    const cerrado = (numero: number, casa: number, visita: number): SetPartido => ({
      id: `s${numero}`,
      partidoId: 'p1',
      numero,
      puntosCasa: casa,
      puntosVisita: visita,
      cerrado: true,
    });
    const { svc, obtenerTabla } = montar(
      [acc({ id: 'a1', setId: 's1' })],
      [cerrado(1, 25, 20), cerrado(2, 25, 22), cerrado(3, 18, 25), cerrado(4, 25, 19)],
    );

    await svc.proyectarPartido('p1');

    const tabla = obtenerTabla();
    expect(tabla.map((f) => f.equipoId)).toEqual(['e1', 'e2']);
    expect(tabla[0]).toMatchObject({
      torneoId: 't1',
      equipoId: 'e1',
      pj: 1,
      pg: 1,
      pp: 0,
      setsFavor: 3,
      setsContra: 1,
      puntos: 3,
    });
    expect(tabla[1]).toMatchObject({ equipoId: 'e2', pg: 0, pp: 1, puntos: 0 });
  });
});
