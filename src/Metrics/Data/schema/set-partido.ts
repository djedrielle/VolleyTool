import { uuid, smallint, boolean } from 'drizzle-orm/pg-core';
import { metrics } from './_schema.js';

// Calca metrics.set_partido. La FK a partido la enforcea la base.
export const setPartido = metrics.table('set_partido', {
  id: uuid('id').primaryKey().defaultRandom(),
  partidoId: uuid('partido_id').notNull(),
  numero: smallint('numero').notNull(),
  puntosCasa: smallint('puntos_casa').notNull().default(0),
  puntosVisita: smallint('puntos_visita').notNull().default(0),
  cerrado: boolean('cerrado').notNull().default(false),
});
