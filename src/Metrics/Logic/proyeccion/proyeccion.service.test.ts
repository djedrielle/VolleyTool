import { describe, it, expect } from 'vitest';
import {
  ProyeccionService,
  type AccionLectura,
  type SetLectura,
  type AgregadosEscritura,
} from './proyeccion.service.js';
import type { Accion } from '../dominio/accion.js';
import type { SetPartido } from '../dominio/set-partido.js';
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

function montar(acciones: Accion[]) {
  const sets: SetPartido[] = [
    { id: 's1', partidoId: 'p1', numero: 1, puntosCasa: 0, puntosVisita: 0, cerrado: false },
  ];
  const setRepo: SetLectura = { listarPorPartido: async () => sets };
  const accionRepo: AccionLectura = {
    listarPorSet: async (id) => acciones.filter((a) => a.setId === id),
  };
  let escrito: Escrito | null = null;
  const agregados: AgregadosEscritura = {
    reemplazarDePartido: async (_partidoId, datos) => {
      escrito = datos;
    },
  };
  const svc = new ProyeccionService(accionRepo, setRepo, agregados);
  return { svc, obtenerEscrito: () => escrito as Escrito | null };
}

describe('ProyeccionService', () => {
  it('proyecta los agregados por jugador, equipo y rotación', async () => {
    const { svc, obtenerEscrito } = montar([
      acc({ id: 'a1', jugadorId: 'j1', equipoId: 'e1', rotacion: 1, tipo: 'ataque', resultado: 'punto_directo', puntoParaEquipoId: 'e1' }),
      acc({ id: 'a2', jugadorId: 'j1', equipoId: 'e1', rotacion: 1, tipo: 'ataque', resultado: 'error' }),
      acc({ id: 'a3', jugadorId: 'j2', equipoId: 'e2', rotacion: 3, tipo: 'saque', resultado: 'ace', puntoParaEquipoId: 'e2' }),
    ]);

    const resumen = await svc.proyectarPartido('p1');
    expect(resumen).toEqual({ jugadores: 2, equipos: 2, rotaciones: 12 });

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

  it('ignora las acciones corregidas', async () => {
    const { svc, obtenerEscrito } = montar([
      acc({ id: 'a1', jugadorId: 'j1', equipoId: 'e1', tipo: 'ataque', resultado: 'punto_directo' }),
      acc({ id: 'a2', jugadorId: 'j1', equipoId: 'e1', tipo: 'ataque', resultado: 'error', corrigeAccionId: 'a1' }),
    ]);

    await svc.proyectarPartido('p1');
    const j1 = obtenerEscrito()!.jugadores.find((x) => x.jugadorId === 'j1')!;
    expect(j1.ataquesTotales).toBe(1);
    expect(j1.ataquesErrados).toBe(1);
    expect(j1.ataquesPuntoDirecto).toBe(0);
  });
});
