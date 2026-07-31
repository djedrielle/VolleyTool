import { uuid, smallint, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { metrics } from './_schema.js';

// Calca metrics.metricas_jugador_partido. Agregado desechable: lo
// (re)escribe el proyector. PK compuesta (jugador, partido) — sin id.
export const metricasJugadorPartido = metrics.table(
  'metricas_jugador_partido',
  {
    jugadorId: uuid('jugador_id').notNull(),
    partidoId: uuid('partido_id').notNull(),
    equipoId: uuid('equipo_id').notNull(),
    setsJugados: smallint('sets_jugados').notNull().default(0),
    ataquesTotales: integer('ataques_totales').notNull().default(0),
    ataquesPuntoDirecto: integer('ataques_punto_directo').notNull().default(0),
    ataquesDefendidos: integer('ataques_defendidos').notNull().default(0),
    ataquesErrados: integer('ataques_errados').notNull().default(0),
    bloqueosTotales: integer('bloqueos_totales').notNull().default(0),
    bloqueosPuntoDirecto: integer('bloqueos_punto_directo').notNull().default(0),
    bloqueosDefendidos: integer('bloqueos_defendidos').notNull().default(0),
    bloqueosErrados: integer('bloqueos_errados').notNull().default(0),
    saquesTotales: integer('saques_totales').notNull().default(0),
    aces: integer('aces').notNull().default(0),
    saquesRecibidos: integer('saques_recibidos').notNull().default(0),
    saquesErrados: integer('saques_errados').notNull().default(0),
    defensasTotales: integer('defensas_totales').notNull().default(0),
    defensasExitosas: integer('defensas_exitosas').notNull().default(0),
    recepcionesTotales: integer('recepciones_totales').notNull().default(0),
    recepcionesPerfectas: integer('recepciones_perfectas').notNull().default(0),
    recepcionesFueraSistema: integer('recepciones_fuera_sistema').notNull().default(0),
    recepcionesErradas: integer('recepciones_erradas').notNull().default(0),
    calculadoEn: timestamp('calculado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.jugadorId, t.partidoId] })],
);
