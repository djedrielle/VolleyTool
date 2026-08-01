import type { FastifyInstance } from 'fastify';
import type { CapturaService } from '../Logic/captura/captura.service.js';
import type { NuevaAccion } from '../Logic/dominio/accion.js';
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

    app.post<{
      Params: { setId: string };
      Body: Omit<NuevaAccion, 'setId' | 'registradoPor'>;
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
