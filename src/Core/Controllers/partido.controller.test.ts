import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { configurarApp } from '../../app.js';
import { partidoRoutes } from './partido.controller.js';
import { PartidoService, type PartidoRepo } from '../Logic/administracion/partido.service.js';
import type { Partido, NuevoPartido, CambiosPartido } from '../Logic/dominio/partido.js';

class RepoFalso implements PartidoRepo {
  private datos: Partido[] = [];
  async listar() {
    return [...this.datos];
  }
  async obtener(id: string) {
    return this.datos.find((p) => p.id === id) ?? null;
  }
  async crear(d: NuevoPartido) {
    const p: Partido = {
      id: String(this.datos.length + 1),
      torneoId: d.torneoId,
      jornada: d.jornada ?? null,
      fechaHora: d.fechaHora,
      sede: d.sede ?? null,
      estado: d.estado ?? 'programado',
      creadoEn: new Date(),
      equipoLocalId: d.equipoLocalId,
      equipoVisitaId: d.equipoVisitaId,
    };
    this.datos.push(p);
    return p;
  }
  async actualizar(id: string, c: CambiosPartido) {
    const p = this.datos.find((x) => x.id === id);
    if (!p) return null;
    Object.assign(p, c);
    return p;
  }
}

function bearer(rol: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: 'u1', rol })).toString('base64url');
  return `Bearer x.${payload}.y`;
}

async function appDePrueba() {
  const app = Fastify({ logger: false });
  configurarApp(app);
  await app.register(partidoRoutes(new PartidoService(new RepoFalso())), { prefix: '/partidos' });
  return app;
}

describe('partido controller', () => {
  it('POST /partidos con dos equipos crea (201) y devuelve local/visita', async () => {
    const app = await appDePrueba();
    const res = await app.inject({
      method: 'POST',
      url: '/partidos',
      headers: { authorization: bearer('administrador') },
      payload: {
        torneoId: 't1',
        fechaHora: '2026-06-12T19:30:00Z',
        equipoLocalId: 'e1',
        equipoVisitaId: 'e2',
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json<{ equipoLocalId: string; equipoVisitaId: string }>();
    expect(body.equipoLocalId).toBe('e1');
    expect(body.equipoVisitaId).toBe('e2');
    await app.close();
  });

  it('POST rechaza un equipo contra sí mismo (400)', async () => {
    const app = await appDePrueba();
    const res = await app.inject({
      method: 'POST',
      url: '/partidos',
      headers: { authorization: bearer('administrador') },
      payload: {
        torneoId: 't1',
        fechaHora: '2026-06-12T19:30:00Z',
        equipoLocalId: 'e1',
        equipoVisitaId: 'e1',
      },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it('POST sin token → 401', async () => {
    const app = await appDePrueba();
    const res = await app.inject({
      method: 'POST',
      url: '/partidos',
      payload: {
        torneoId: 't1',
        fechaHora: '2026-06-12T19:30:00Z',
        equipoLocalId: 'e1',
        equipoVisitaId: 'e2',
      },
    });
    expect(res.statusCode).toBe(401);
    await app.close();
  });
});
