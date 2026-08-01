import { describe, it, expect } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { configurarApp } from '../../app.js';
import { capturaRoutes } from './captura.controller.js';
import {
  CapturaService,
  type AccionRepo,
  type SetPartidoRepo,
  type Proyector,
} from '../Logic/captura/captura.service.js';
import type { Accion, NuevaAccion } from '../Logic/dominio/accion.js';
import type { SetPartido, NuevoSet } from '../Logic/dominio/set-partido.js';

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
  const proyector = new ProyectorFalso();
  const app = Fastify({ logger: false });
  configurarApp(app);
  await app.register(capturaRoutes(new CapturaService(acciones, sets, proyector)), {
    prefix: '/captura',
  });
  return { app, acciones, proyector };
}

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
