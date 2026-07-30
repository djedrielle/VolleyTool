import type { FastifyInstance } from 'fastify';
import type { EquipoService } from '../Logic/administracion/equipo.service.js';
import type { NuevoEquipo } from '../Logic/dominio/equipo.js';
import { requireRole } from '../../shared/http/auth.js';

// El controller recibe el servicio ya construido (inyección): no conoce
// la base ni cómo se arma el repo. Solo traduce HTTP ↔ dominio; no
// calcula nada. La validación de negocio la hace el servicio (lanza
// ErrorValidacion), que el manejador global mapea a 400.
export function equipoRoutes(service: EquipoService) {
  return async function (app: FastifyInstance): Promise<void> {
    app.get('/', async () => service.listar());

    app.get<{ Params: { id: string } }>('/:id', async (req) =>
      service.obtener(req.params.id),
    );

    app.post<{ Body: NuevoEquipo }>(
      '/',
      { preHandler: requireRole('administrador') },
      async (req, reply) => {
        const creado = await service.crear(req.body);
        return reply.code(201).send(creado);
      },
    );

    app.patch<{ Params: { id: string }; Body: Partial<NuevoEquipo> }>(
      '/:id',
      { preHandler: requireRole('administrador') },
      async (req) => service.actualizar(req.params.id, req.body),
    );
  };
}
