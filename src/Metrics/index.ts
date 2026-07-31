import type { FastifyInstance } from 'fastify';
import { CapturaService } from './Logic/captura/captura.service.js';
import { DrizzleAccionRepo } from './Data/repos/accion.repo.js';
import { DrizzleSetPartidoRepo } from './Data/repos/set-partido.repo.js';
import { capturaRoutes } from './Controllers/captura.controller.js';
import { ProyeccionService } from './Logic/proyeccion/proyeccion.service.js';
import { ConsultasService } from './Logic/consultas/consultas.service.js';
import { DrizzleAgregadosRepo } from './Data/repos/agregados.repo.js';
import { metricasRoutes } from './Controllers/metricas.controller.js';

// Composición del dominio Metrics: captura (escritura), proyección
// (agregados) y consultas (lectura). Un mismo repo de acciones/sets sirve
// a captura y al proyector; el de agregados sirve a proyección y consultas.
export async function registrarMetrics(app: FastifyInstance): Promise<void> {
  const acciones = new DrizzleAccionRepo();
  const sets = new DrizzleSetPartidoRepo();
  const agregados = new DrizzleAgregadosRepo();

  const captura = new CapturaService(acciones, sets);
  await app.register(capturaRoutes(captura), { prefix: '/captura' });

  const proyeccion = new ProyeccionService(acciones, sets, agregados);
  const consultas = new ConsultasService(agregados);
  await app.register(metricasRoutes(proyeccion, consultas), { prefix: '/metricas' });
}
