import type { FastifyInstance } from 'fastify';
import type { TorneoService } from '../Logic/administracion/torneo.service.js';
import type { NuevoTorneo } from '../Logic/dominio/torneo.js';
import { requireRole } from '../../shared/http/auth.js';

export function torneoRoutes(service: TorneoService) {
  return async function (app: FastifyInstance): Promise<void> {
    app.get('/', async () => service.listar());

    app.get<{ Params: { id: string } }>('/:id', async (req) =>
      service.obtener(req.params.id),
    );

    app.post<{ Body: NuevoTorneo }>(
      '/',
      { preHandler: requireRole('administrador') },
      async (req, reply) => reply.code(201).send(await service.crear(req.body)),
    );

    app.patch<{ Params: { id: string }; Body: Partial<NuevoTorneo> }>(
      '/:id',
      { preHandler: requireRole('administrador') },
      async (req) => service.actualizar(req.params.id, req.body),
    );
  };
}
