import type { FastifyInstance } from 'fastify';
import type { CuerpoTecnicoService } from '../Logic/administracion/cuerpo-tecnico.service.js';
import type { NuevoCuerpoTecnico } from '../Logic/dominio/cuerpo-tecnico.js';
import { requireRole } from '../../shared/http/auth.js';

export function cuerpoTecnicoRoutes(service: CuerpoTecnicoService) {
  return async function (app: FastifyInstance): Promise<void> {
    app.get('/', async () => service.listar());

    app.get<{ Params: { id: string } }>('/:id', async (req) =>
      service.obtener(req.params.id),
    );

    app.post<{ Body: NuevoCuerpoTecnico }>(
      '/',
      { preHandler: requireRole('administrador') },
      async (req, reply) => reply.code(201).send(await service.crear(req.body)),
    );

    app.patch<{ Params: { id: string }; Body: Partial<NuevoCuerpoTecnico> }>(
      '/:id',
      { preHandler: requireRole('administrador') },
      async (req) => service.actualizar(req.params.id, req.body),
    );
  };
}
