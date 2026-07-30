import type { FastifyInstance } from 'fastify';
import type { PartidoService } from '../Logic/administracion/partido.service.js';
import type { NuevoPartido, CambiosPartido } from '../Logic/dominio/partido.js';
import { requireRole } from '../../shared/http/auth.js';

export function partidoRoutes(service: PartidoService) {
  return async function (app: FastifyInstance): Promise<void> {
    app.get('/', async () => service.listar());

    app.get<{ Params: { id: string } }>('/:id', async (req) =>
      service.obtener(req.params.id),
    );

    // Programa el partido con sus dos equipos de una sola vez.
    app.post<{ Body: NuevoPartido }>(
      '/',
      { preHandler: requireRole('administrador') },
      async (req, reply) => reply.code(201).send(await service.crear(req.body)),
    );

    app.patch<{ Params: { id: string }; Body: CambiosPartido }>(
      '/:id',
      { preHandler: requireRole('administrador') },
      async (req) => service.actualizar(req.params.id, req.body),
    );
  };
}
