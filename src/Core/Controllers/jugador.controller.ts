import type { FastifyInstance } from 'fastify';
import type { JugadorService } from '../Logic/administracion/jugador.service.js';
import type { NuevoJugador } from '../Logic/dominio/jugador.js';
import { requireRole } from '../../shared/http/auth.js';

export function jugadorRoutes(service: JugadorService) {
  return async function (app: FastifyInstance): Promise<void> {
    app.get('/', async () => service.listar());

    app.get<{ Params: { id: string } }>('/:id', async (req) =>
      service.obtener(req.params.id),
    );

    app.post<{ Body: NuevoJugador }>(
      '/',
      { preHandler: requireRole('administrador') },
      async (req, reply) => reply.code(201).send(await service.crear(req.body)),
    );

    app.patch<{ Params: { id: string }; Body: Partial<NuevoJugador> }>(
      '/:id',
      { preHandler: requireRole('administrador') },
      async (req) => service.actualizar(req.params.id, req.body),
    );
  };
}
