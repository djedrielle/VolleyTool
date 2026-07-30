import { uuid, smallint, boolean, date } from 'drizzle-orm/pg-core';
import { metrics, posicion } from './_schema.js';

// Calca metrics.plantilla. FKs (jugador, equipo, torneo) y el
// UNIQUE(equipo, torneo, numero) los enforcea la base.
export const plantilla = metrics.table('plantilla', {
  id: uuid('id').primaryKey().defaultRandom(),
  jugadorId: uuid('jugador_id').notNull(),
  equipoId: uuid('equipo_id').notNull(),
  torneoId: uuid('torneo_id').notNull(),
  numero: smallint('numero').notNull(),
  posicion: posicion('posicion').notNull(),
  esCapitan: boolean('es_capitan').notNull().default(false),
  desde: date('desde'),
  hasta: date('hasta'),
});
