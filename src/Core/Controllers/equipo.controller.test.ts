import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { configurarApp } from '../../app.js';
import { equipoRoutes } from './equipo.controller.js';
import { EquipoService, type EquipoRepo } from '../Logic/administracion/equipo.service.js';
import type { Equipo, NuevoEquipo } from '../Logic/dominio/equipo.js';

class RepoFalso implements EquipoRepo {
  private datos: Equipo[] = [];
  async listar() {
    return [...this.datos];
  }
  async obtener(id: string) {
    return this.datos.find((e) => e.id === id) ?? null;
  }
  async crear(d: NuevoEquipo) {
    const e: Equipo = {
      id: String(this.datos.length + 1),
      creadoEn: new Date(),
      provincia: null,
      sede: null,
      color: null,
      fundado: null,
      ...d,
    };
    this.datos.push(e);
    return e;
  }
  async actualizar(id: string, cambios: Partial<NuevoEquipo>) {
    const e = this.datos.find((x) => x.id === id);
    if (!e) return null;
    Object.assign(e, cambios);
    return e;
  }
}

// Token de prueba: header.payload.firma con el payload en base64url.
// autenticar() todavía no verifica la firma, así que basta el payload.
function bearer(rol: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: 'u1', rol })).toString('base64url');
  return `Bearer x.${payload}.y`;
}

async function appDePrueba() {
  const app = Fastify({ logger: false });
  configurarApp(app);
  await app.register(equipoRoutes(new EquipoService(new RepoFalso())), { prefix: '/equipos' });
  return app;
}

describe('equipo controller', () => {
  it('GET /equipos responde 200 y lista vacía', async () => {
    const app = await appDePrueba();
    const res = await app.inject({ method: 'GET', url: '/equipos' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
    await app.close();
  });

  it('POST sin token → 401', async () => {
    const app = await appDePrueba();
    const res = await app.inject({
      method: 'POST',
      url: '/equipos',
      payload: { nombre: 'Volcanes', corto: 'VOL', categoria: 'femenino' },
    });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it('POST con rol capturador → 403', async () => {
    const app = await appDePrueba();
    const res = await app.inject({
      method: 'POST',
      url: '/equipos',
      headers: { authorization: bearer('capturador') },
      payload: { nombre: 'Volcanes', corto: 'VOL', categoria: 'femenino' },
    });
    expect(res.statusCode).toBe(403);
    await app.close();
  });

  it('POST con rol administrador crea (201)', async () => {
    const app = await appDePrueba();
    const res = await app.inject({
      method: 'POST',
      url: '/equipos',
      headers: { authorization: bearer('administrador') },
      payload: { nombre: 'Volcanes', corto: 'VOL', categoria: 'femenino' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json<{ nombre: string }>().nombre).toBe('Volcanes');
    await app.close();
  });

  it('POST con datos inválidos → 400', async () => {
    const app = await appDePrueba();
    const res = await app.inject({
      method: 'POST',
      url: '/equipos',
      headers: { authorization: bearer('administrador') },
      payload: { nombre: '', corto: 'A', categoria: 'femenino' },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });
});
