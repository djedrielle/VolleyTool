import type { FastifyInstance } from 'fastify';
import { CapturaService } from './Logic/captura/captura.service.js';
import { DrizzleAccionRepo } from './Data/repos/accion.repo.js';
import { DrizzleSetPartidoRepo } from './Data/repos/set-partido.repo.js';
import { capturaRoutes } from './Controllers/captura.controller.js';
import { ProyeccionService } from './Logic/proyeccion/proyeccion.service.js';
import { ConsultasService } from './Logic/consultas/consultas.service.js';
import { DrizzleAgregadosRepo } from './Data/repos/agregados.repo.js';
import { DrizzleClasificacionRepo } from './Data/repos/clasificacion.repo.js';
import { CoreClientLocal } from './Data/core.client.js';
import { metricasRoutes } from './Controllers/metricas.controller.js';

// Composición del dominio Metrics: captura (escritura), proyección
// (agregados) y consultas (lectura). La captura recibe el proyector para
// dispararlo al cerrar un set. Un mismo repo de acciones/sets sirve a
// captura y al proyector; los de agregados y clasificación, a proyección
// y consultas. El cliente de Core es la única puerta al otro dominio.
export async function registrarMetrics(app: FastifyInstance): Promise<void> {
  const acciones = new DrizzleAccionRepo();
  const sets = new DrizzleSetPartidoRepo();
  const agregados = new DrizzleAgregadosRepo();
  const tablas = new DrizzleClasificacionRepo();
  const core = new CoreClientLocal();

  const proyeccion = new ProyeccionService(acciones, sets, agregados, tablas, core);
  const consultas = new ConsultasService(agregados, tablas);
  const captura = new CapturaService(acciones, sets, proyeccion);

  await app.register(capturaRoutes(captura), { prefix: '/captura' });
  await app.register(metricasRoutes(proyeccion, consultas), { prefix: '/metricas' });
}
