import type { FastifyInstance } from 'fastify';
import type { ProyeccionService } from '../Logic/proyeccion/proyeccion.service.js';
import type { ConsultasService } from '../Logic/consultas/consultas.service.js';
import { requireRole } from '../../shared/http/auth.js';

export function metricasRoutes(proyeccion: ProyeccionService, consultas: ConsultasService) {
  return async function (app: FastifyInstance): Promise<void> {
    // Dispara el proyector: recalcula los agregados del partido desde sus
    // acciones y, en cascada, la tabla de su torneo. Idempotente. Cerrar
    // un set ya lo dispara solo; esto queda para reprocesar a mano.
    app.post<{ Params: { partidoId: string } }>(
      '/partidos/:partidoId/recalcular',
      { preHandler: requireRole('capturador', 'administrador') },
      async (req) => proyeccion.proyectarPartido(req.params.partidoId),
    );

    // Rehace solo la tabla de posiciones del torneo.
    app.post<{ Params: { torneoId: string } }>(
      '/torneos/:torneoId/recalcular',
      { preHandler: requireRole('capturador', 'administrador') },
      async (req) => proyeccion.proyectarTorneo(req.params.torneoId),
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
    app.get<{ Params: { torneoId: string } }>('/torneos/:torneoId/clasificacion', async (req) =>
      consultas.clasificacion(req.params.torneoId),
    );
  };
}
