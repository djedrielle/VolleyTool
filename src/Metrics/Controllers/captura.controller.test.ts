import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { configurarApp } from '../../app.js';
import { capturaRoutes } from './captura.controller.js';
import {
  CapturaService,
  type AccionRepo,
  type SetPartidoRepo,
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
}

class AccionesFalso implements AccionRepo {
  private datos: Accion[] = [];
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

function bearer(rol: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: 'u1', rol })).toString('base64url');
  return `Bearer x.${payload}.y`;
}

async function appDePrueba() {
  const app = Fastify({ logger: false });
  configurarApp(app);
  await app.register(capturaRoutes(new CapturaService(new AccionesFalso(), new SetsFalso())), {
    prefix: '/captura',
  });
  return app;
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
    const app = await appDePrueba();

    const resSet = await app.inject({
      method: 'POST',
      url: '/captura/sets',
      headers: { authorization: bearer('capturador') },
      payload: { partidoId: 'p1', numero: 1 },
    });
    expect(resSet.statusCode).toBe(201);
    const setId = resSet.json<{ id: string }>().id;

    const resAcc = await app.inject({
      method: 'POST',
      url: `/captura/sets/${setId}/acciones`,
      headers: { authorization: bearer('capturador') },
      payload: accionValida,
    });
    expect(resAcc.statusCode).toBe(201);
    expect(resAcc.json<{ tipo: string }>().tipo).toBe('saque');

    await app.close();
  });

  it('rechaza un resultado inválido para el tipo (400)', async () => {
    const app = await appDePrueba();
    const resSet = await app.inject({
      method: 'POST',
      url: '/captura/sets',
      headers: { authorization: bearer('capturador') },
      payload: { partidoId: 'p1', numero: 1 },
    });
    const setId = resSet.json<{ id: string }>().id;

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
    const app = await appDePrueba();
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
    const app = await appDePrueba();
    const res = await app.inject({
      method: 'POST',
      url: '/captura/sets',
      payload: { partidoId: 'p1', numero: 1 },
    });
    expect(res.statusCode).toBe(401);
    await app.close();
  });
});
