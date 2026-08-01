import type { FastifyInstance } from 'fastify';
import type { CapturaService } from '../Logic/captura/captura.service.js';
import type { AccionEntrante } from '../Logic/dominio/accion.js';
import type { JugadorAlineado } from '../Logic/dominio/alineacion.js';
import { requireRole } from '../../shared/http/auth.js';

// El controller de captura: lo operan el capturador o el administrador.
// El id de quien registra sale del token, no del body.
export function capturaRoutes(service: CapturaService) {
  return async function (app: FastifyInstance): Promise<void> {
    app.post<{ Body: { partidoId: string; numero: number } }>(
      '/sets',
      { preHandler: requireRole('capturador', 'administrador') },
      async (req, reply) => reply.code(201).send(await service.abrirSet(req.body)),
    );

    app.get<{ Params: { partidoId: string } }>(
      '/partidos/:partidoId/sets',
      async (req) => service.setsDePartido(req.params.partidoId),
    );

    // `rotacion` es opcional en el body: si no viene, la captura la deduce.
    app.post<{
      Params: { setId: string };
      Body: Omit<AccionEntrante, 'setId' | 'registradoPor'>;
    }>(
      '/sets/:setId/acciones',
      { preHandler: requireRole('capturador', 'administrador') },
      async (req, reply) =>
        reply.code(201).send(
          await service.registrarAccion({
            ...req.body,
            setId: req.params.setId,
            registradoPor: req.usuario?.id ?? null,
          }),
        ),
    );

    app.get<{ Params: { setId: string } }>('/sets/:setId/acciones', async (req) =>
      service.accionesDeSet(req.params.setId),
    );

    // La alineación se reemplaza entera (PUT): declararla de nuevo la
    // corrige mientras el set siga abierto.
    app.put<{
      Params: { setId: string };
      Body: { equipoId: string; jugadores: JugadorAlineado[] };
    }>(
      '/sets/:setId/alineacion',
      { preHandler: requireRole('capturador', 'administrador') },
      async (req) =>
        service.declararAlineacion(
          req.params.setId,
          req.body.equipoId,
          req.body.jugadores ?? [],
        ),
    );

    app.get<{ Params: { setId: string } }>('/sets/:setId/alineacion', async (req) =>
      service.alineacionDeSet(req.params.setId),
    );

    // Un cambio: quién sale, quién entra y en qué rally.
    app.post<{
      Params: { setId: string };
      Body: { equipoId: string; saleJugadorId: string; entraJugadorId: string; rally: number };
    }>(
      '/sets/:setId/cambios',
      { preHandler: requireRole('capturador', 'administrador') },
      async (req, reply) =>
        reply
          .code(201)
          .send(await service.sustituir(req.params.setId, req.body.equipoId, req.body)),
    );

    // La cancha ahora mismo: rotación de cada equipo y dónde está cada quien.
    app.get<{ Params: { setId: string } }>('/sets/:setId/cancha', async (req) =>
      service.cancha(req.params.setId),
    );

    // Deshacer la última acción del set (anexa una anulación).
    app.post<{ Params: { setId: string } }>(
      '/sets/:setId/deshacer',
      { preHandler: requireRole('capturador', 'administrador') },
      async (req, reply) =>
        reply.code(201).send(await service.deshacer(req.params.setId, req.usuario?.id ?? null)),
    );

    // Cerrar el set: fija el marcador y dispara la proyección del partido.
    app.post<{ Params: { setId: string }; Body: { puntosCasa?: number; puntosVisita?: number } }>(
      '/sets/:setId/cerrar',
      { preHandler: requireRole('capturador', 'administrador') },
      async (req) => service.cerrarSet(req.params.setId, req.body ?? {}),
    );
  };
}
