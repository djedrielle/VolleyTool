import type { FastifyInstance } from 'fastify';
import type { ProyeccionService } from '../Logic/proyeccion/proyeccion.service.js';
import type { ConsultasService } from '../Logic/consultas/consultas.service.js';
import { requireRole } from '../../shared/http/auth.js';

export function metricasRoutes(proyeccion: ProyeccionService, consultas: ConsultasService) {
  return async function (app: FastifyInstance): Promise<void> {
    // Dispara el proyector: recalcula los agregados del partido desde sus
    // acciones. Idempotente. Manual por ahora, hasta que "cerrar set" lo
    // dispare automáticamente.
    app.post<{ Params: { partidoId: string } }>(
      '/partidos/:partidoId/recalcular',
      { preHandler: requireRole('capturador', 'administrador') },
      async (req) => proyeccion.proyectarPartido(req.params.partidoId),
    );

    // Lecturas (camino de consultas): agregados ya calculados.
    app.get<{ Params: { partidoId: string } }>('/partidos/:partidoId/jugadores', async (req) =>
      consultas.metricasJugador(req.params.partidoId),
    );
    app.get<{ Params: { partidoId: string } }>('/partidos/:partidoId/equipos', async (req) =>
      consultas.metricasEquipo(req.params.partidoId),
    );
    app.get<{ Params: { partidoId: string } }>('/partidos/:partidoId/rotaciones', async (req) =>
      consultas.metricasRotacion(req.params.partidoId),
    );
  };
}
