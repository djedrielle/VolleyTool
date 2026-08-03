import { describe, it, expect } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { configurarApp } from '../../app.js';
import { capturaRoutes } from './captura.controller.js';
import {
  CapturaService,
  type AccionRepo,
  type SetPartidoRepo,
  type AlineacionRepo,
  type Proyector,
} from '../Logic/captura/captura.service.js';
import type { Accion, NuevaAccion } from '../Logic/dominio/accion.js';
import type { SetPartido, NuevoSet } from '../Logic/dominio/set-partido.js';
import type {
  Alineacion,
  NuevaAlineacion,
  JugadorAlineado,
} from '../Logic/dominio/alineacion.js';

class SetsFalso implements SetPartidoRepo {
  private datos: SetPartido[] = [];
  async crear(d: NuevoSet) {
    const s: SetPartido = {
      id: String(this.datos.length + 1),
      partidoId: d.partidoId,
      numero: d.numero,
      puntosCasa: 0,
      puntosVisita: 0,
      cerrado: false,
    };
    this.datos.push(s);
    return s;
  }
  async obtener(id: string) {
    return this.datos.find((s) => s.id === id) ?? null;
  }
  async listarPorPartido(partidoId: string) {
    return this.datos.filter((s) => s.partidoId === partidoId);
  }
  async cerrar(id: string, marcador: { puntosCasa: number; puntosVisita: number }) {
    const s = this.datos.find((x) => x.id === id);
    if (!s) return null;
    s.cerrado = true;
    s.puntosCasa = marcador.puntosCasa;
    s.puntosVisita = marcador.puntosVisita;
    return s;
  }
}

class AccionesFalso implements AccionRepo {
  datos: Accion[] = [];
  async anexar(d: NuevaAccion) {
    const a: Accion = {
      id: String(this.datos.length + 1),
      corrigeAccionId: null,
      registradoEn: new Date(),
      puntoParaEquipoId: d.puntoParaEquipoId ?? null,
      registradoPor: d.registradoPor ?? null,
      ...d,
    };
    this.datos.push(a);
    return a;
  }
  async listarPorSet(setId: string) {
    return this.datos.filter((a) => a.setId === setId);
  }
}

class AlineacionesFalso implements AlineacionRepo {
  datos: Alineacion[] = [];
  async declarar(setId: string, equipoId: string, jugadores: JugadorAlineado[]) {
    this.datos = this.datos.filter((a) => !(a.setId === setId && a.equipoId === equipoId));
    const filas = jugadores.map((j, i) => ({
      id: `${setId}-${equipoId}-${i}`,
      setId,
      equipoId,
      jugadorId: j.jugadorId,
      posicionInicial: j.posicionInicial ?? null,
      esArmador: j.esArmador ?? false,
      esLibero: j.esLibero ?? false,
      entraEnRally: null,
      saleEnRally: null,
    }));
    this.datos.push(...filas);
    return filas;
  }
  async listarPorSet(setId: string) {
    return this.datos.filter((a) => a.setId === setId);
  }
  async sustituir(saleId: string, rally: number, entra: NuevaAlineacion) {
    const sale = this.datos.find((a) => a.id === saleId)!;
    sale.saleEnRally = rally;
    sale.esArmador = false;
    const fila = { id: `sub-${this.datos.length}`, ...entra };
    this.datos.push(fila);
    return fila;
  }
}

class ProyectorFalso implements Proyector {
  llamados: string[] = [];
  async proyectarPartido(partidoId: string) {
    this.llamados.push(partidoId);
    return {};
  }
}

function bearer(rol: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: 'u1', rol })).toString('base64url');
  return `Bearer x.${payload}.y`;
}

async function montar() {
  const acciones = new AccionesFalso();
  const sets = new SetsFalso();
  const alineaciones = new AlineacionesFalso();
  const proyector = new ProyectorFalso();
  const app = Fastify({ logger: false });
  configurarApp(app);
  await app.register(
    capturaRoutes(new CapturaService(acciones, sets, alineaciones, proyector)),
    { prefix: '/captura' },
  );
  return { app, acciones, alineaciones, proyector };
}

const TITULARES = [1, 2, 3, 4, 5, 6].map((p) => ({ jugadorId: `j${p}`, posicionInicial: p }));

async function abrirSet(app: FastifyInstance): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/captura/sets',
    headers: { authorization: bearer('capturador') },
    payload: { partidoId: 'p1', numero: 1 },
  });
  return res.json<{ id: string }>().id;
}

const accionValida = {
  equipoId: 'e1',
  jugadorId: 'j1',
  rally: 1,
  ordenEnRally: 1,
  rotacion: 3,
  tipo: 'saque',
  resultado: 'ace',
};

// La misma acción pero sin rotación, para que la deduzca la captura.
const { rotacion: _rotacionFija, ...accionSinRotacion } = accionValida;

describe('captura controller', () => {
  it('abre un set y registra una acción (201)', async () => {
    const { app } = await montar();
    const setId = await abrirSet(app);
    const res = await app.inject({
      method: 'POST',
      url: `/captura/sets/${setId}/acciones`,
      headers: { authorization: bearer('capturador') },
      payload: accionValida,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json<{ tipo: string }>().tipo).toBe('saque');
    await app.close();
  });

  it('rechaza un resultado inválido para el tipo (400)', async () => {
    const { app } = await montar();
    const setId = await abrirSet(app);
    const res = await app.inject({
      method: 'POST',
      url: `/captura/sets/${setId}/acciones`,
      headers: { authorization: bearer('capturador') },
      payload: { ...accionValida, tipo: 'ataque', resultado: 'ace' },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it('rechaza registrar en un set inexistente (404)', async () => {
    const { app } = await montar();
    const res = await app.inject({
      method: 'POST',
      url: '/captura/sets/no-existe/acciones',
      headers: { authorization: bearer('capturador') },
      payload: accionValida,
    });
    expect(res.statusCode).toBe(404);
    await app.close();
  });

  it('exige rol capturador o administrador (401 sin token)', async () => {
    const { app } = await montar();
    const res = await app.inject({
      method: 'POST',
      url: '/captura/sets',
      payload: { partidoId: 'p1', numero: 1 },
    });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it('cerrar el set dispara la proyección del partido', async () => {
    const { app, proyector } = await montar();
    const setId = await abrirSet(app);
    const res = await app.inject({
      method: 'POST',
      url: `/captura/sets/${setId}/cerrar`,
      headers: { authorization: bearer('capturador') },
      payload: { puntosCasa: 25, puntosVisita: 20 },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ cerrado: boolean }>().cerrado).toBe(true);
    expect(proyector.llamados).toEqual(['p1']);
    await app.close();
  });

  it('deshacer anula la última acción del set', async () => {
    const { app } = await montar();
    const setId = await abrirSet(app);
    const reg = await app.inject({
      method: 'POST',
      url: `/captura/sets/${setId}/acciones`,
      headers: { authorization: bearer('capturador') },
      payload: accionValida,
    });
    const accionId = reg.json<{ id: string }>().id;

    const res = await app.inject({
      method: 'POST',
      url: `/captura/sets/${setId}/deshacer`,
      headers: { authorization: bearer('capturador') },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json<{ corrigeAccionId: string }>().corrigeAccionId).toBe(accionId);
    await app.close();
  });

  it('deduce la rotación cuando el body no la manda', async () => {
    const { app, acciones } = await montar();
    const setId = await abrirSet(app);
    const registrar = (body: Record<string, unknown>) =>
      app.inject({
        method: 'POST',
        url: `/captura/sets/${setId}/acciones`,
        headers: { authorization: bearer('capturador') },
        payload: body,
      });

    // e1 saca y e2 gana el punto recibiendo: e2 rota, e1 no.
    await registrar({ ...accionSinRotacion, equipoId: 'e1', rally: 1, ordenEnRally: 1 });
    await registrar({
      ...accionSinRotacion,
      equipoId: 'e2',
      rally: 1,
      ordenEnRally: 2,
      tipo: 'ataque',
      resultado: 'punto_directo',
      puntoParaEquipoId: 'e2',
    });
    const res = await registrar({
      ...accionSinRotacion,
      equipoId: 'e2',
      rally: 2,
      ordenEnRally: 1,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json<{ rotacion: number }>().rotacion).toBe(2);
    expect(acciones.datos[0]!.rotacion).toBe(1);
    await app.close();
  });

  it('arranca en la rotación del armador (no siempre en la 1)', async () => {
    const { app } = await montar();
    const setId = await abrirSet(app);
    // el armador abre en la zona 3: el equipo arranca en rotación 3
    const jugadores = TITULARES.map((t) =>
      t.jugadorId === 'j3' ? { ...t, esArmador: true } : t,
    );
    await app.inject({
      method: 'PUT',
      url: `/captura/sets/${setId}/alineacion`,
      headers: { authorization: bearer('capturador') },
      payload: { equipoId: 'e1', jugadores },
    });

    // sin mandar rotación: se deduce y queda anclada al armador
    const res = await app.inject({
      method: 'POST',
      url: `/captura/sets/${setId}/acciones`,
      headers: { authorization: bearer('capturador') },
      payload: { ...accionSinRotacion, equipoId: 'e1', rally: 1, ordenEnRally: 1 },
    });
    expect(res.json<{ rotacion: number }>().rotacion).toBe(3);

    const cancha = await app.inject({ method: 'GET', url: `/captura/sets/${setId}/cancha` });
    expect(cancha.json<{ rotacion: number }[]>()[0]!.rotacion).toBe(3);
    await app.close();
  });

  it('declara la alineación y muestra la cancha', async () => {
    const { app } = await montar();
    const setId = await abrirSet(app);

    const declarar = await app.inject({
      method: 'PUT',
      url: `/captura/sets/${setId}/alineacion`,
      headers: { authorization: bearer('capturador') },
      payload: { equipoId: 'e1', jugadores: [...TITULARES, { jugadorId: 'lib', esLibero: true }] },
    });
    expect(declarar.statusCode).toBe(200);

    const cancha = await app.inject({ method: 'GET', url: `/captura/sets/${setId}/cancha` });
    const [equipo] = cancha.json<
      { equipoId: string; rotacion: number; jugadores: { jugadorId: string; zona: number | null }[] }[]
    >();
    expect(equipo!.rotacion).toBe(1);
    expect(equipo!.jugadores).toContainEqual({ jugadorId: 'j3', zona: 3, delantero: true });
    expect(equipo!.jugadores).toContainEqual({ jugadorId: 'lib', zona: null, delantero: false });
    await app.close();
  });

  it('rechaza una alineación incompleta (400)', async () => {
    const { app } = await montar();
    const setId = await abrirSet(app);
    const res = await app.inject({
      method: 'PUT',
      url: `/captura/sets/${setId}/alineacion`,
      headers: { authorization: bearer('capturador') },
      payload: { equipoId: 'e1', jugadores: TITULARES.slice(0, 4) },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it('el cambio hereda la posición del que sale', async () => {
    const { app, alineaciones } = await montar();
    const setId = await abrirSet(app);
    await app.inject({
      method: 'PUT',
      url: `/captura/sets/${setId}/alineacion`,
      headers: { authorization: bearer('capturador') },
      payload: { equipoId: 'e1', jugadores: TITULARES },
    });

    const res = await app.inject({
      method: 'POST',
      url: `/captura/sets/${setId}/cambios`,
      headers: { authorization: bearer('capturador') },
      payload: { equipoId: 'e1', saleJugadorId: 'j4', entraJugadorId: 'j99', rally: 7 },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json<{ posicionInicial: number; entraEnRally: number }>()).toMatchObject({
      posicionInicial: 4,
      entraEnRally: 7,
    });
    expect(alineaciones.datos.find((a) => a.jugadorId === 'j4')!.saleEnRally).toBe(7);
    await app.close();
  });

  it('deshacer sin acciones que anular (400)', async () => {
    const { app } = await montar();
    const setId = await abrirSet(app);
    const res = await app.inject({
      method: 'POST',
      url: `/captura/sets/${setId}/deshacer`,
      headers: { authorization: bearer('capturador') },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });
});
