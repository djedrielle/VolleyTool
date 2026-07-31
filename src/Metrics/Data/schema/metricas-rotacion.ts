import { uuid, smallint, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { metrics } from './_schema.js';

// Calca metrics.metricas_rotacion. PK compuesta (equipo, partido, rotacion).
export const metricasRotacion = metrics.table(
  'metricas_rotacion',
  {
    equipoId: uuid('equipo_id').notNull(),
    partidoId: uuid('partido_id').notNull(),
    rotacion: smallint('rotacion').notNull(),
    ataques: integer('ataques').notNull().default(0),
    puntosDirectos: integer('puntos_directos').notNull().default(0),
    puntosTotales: integer('puntos_totales').notNull().default(0),
    calculadoEn: timestamp('calculado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.equipoId, t.partidoId, t.rotacion] })],
);
