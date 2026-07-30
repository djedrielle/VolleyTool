import type { FastifyInstance } from 'fastify';
import type { PlantillaService } from '../Logic/administracion/plantilla.service.js';
import type { NuevaPlantilla } from '../Logic/dominio/plantilla.js';
import { requireRole } from '../../shared/http/auth.js';

export function plantillaRoutes(service: PlantillaService) {
  return async function (app: FastifyInstance): Promise<void> {
    app.get('/', async () => service.listar());

    app.get<{ Params: { id: string } }>('/:id', async (req) =>
      service.obtener(req.params.id),
    );

    app.post<{ Body: NuevaPlantilla }>(
      '/',
      { preHandler: requireRole('administrador') },
      async (req, reply) => reply.code(201).send(await service.crear(req.body)),
    );

    app.patch<{ Params: { id: string }; Body: Partial<NuevaPlantilla> }>(
      '/:id',
      { preHandler: requireRole('administrador') },
      async (req) => service.actualizar(req.params.id, req.body),
    );
  };
}
