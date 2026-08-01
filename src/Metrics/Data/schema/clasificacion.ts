import { uuid, smallint, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { metrics } from './_schema.js';

// Calca metrics.clasificacion. PK compuesta (torneo, equipo): una fila
// por equipo en cada torneo, como el resto de los agregados.
export const clasificacion = metrics.table(
  'clasificacion',
  {
    torneoId: uuid('torneo_id').notNull(),
    equipoId: uuid('equipo_id').notNull(),
    pj: smallint('pj').notNull().default(0),
    pg: smallint('pg').notNull().default(0),
    pp: smallint('pp').notNull().default(0),
    setsFavor: smallint('sets_favor').notNull().default(0),
    setsContra: smallint('sets_contra').notNull().default(0),
    puntos: smallint('puntos').notNull().default(0),
    calculadoEn: timestamp('calculado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.torneoId, t.equipoId] })],
);
