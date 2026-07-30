import type { FastifyInstance } from 'fastify';
import type { PlantillaTecnicoService } from '../Logic/administracion/plantilla-tecnico.service.js';
import type { NuevaPlantillaTecnico } from '../Logic/dominio/plantilla-tecnico.js';
import { requireRole } from '../../shared/http/auth.js';

export function plantillaTecnicoRoutes(service: PlantillaTecnicoService) {
  return async function (app: FastifyInstance): Promise<void> {
    app.get('/', async () => service.listar());

    app.get<{ Params: { id: string } }>('/:id', async (req) =>
      service.obtener(req.params.id),
    );

    app.post<{ Body: NuevaPlantillaTecnico }>(
      '/',
      { preHandler: requireRole('administrador') },
      async (req, reply) => reply.code(201).send(await service.crear(req.body)),
    );

    app.patch<{ Params: { id: string }; Body: Partial<NuevaPlantillaTecnico> }>(
      '/:id',
      { preHandler: requireRole('administrador') },
      async (req) => service.actualizar(req.params.id, req.body),
    );
  };
}
