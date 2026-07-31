import type { FastifyInstance } from 'fastify';
import { CapturaService } from './Logic/captura/captura.service.js';
import { DrizzleAccionRepo } from './Data/repos/accion.repo.js';
import { DrizzleSetPartidoRepo } from './Data/repos/set-partido.repo.js';
import { capturaRoutes } from './Controllers/captura.controller.js';

// Composición del dominio Metrics. Por ahora solo el camino de escritura
// (captura); el proyector, los agregados y las consultas llegan después.
export async function registrarMetrics(app: FastifyInstance): Promise<void> {
  const captura = new CapturaService(new DrizzleAccionRepo(), new DrizzleSetPartidoRepo());
  await app.register(capturaRoutes(captura), { prefix: '/captura' });
}
