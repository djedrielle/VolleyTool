import { uuid } from 'drizzle-orm/pg-core';
import { metrics, condicion } from './_schema.js';

// Calca metrics.partido_equipo: qué equipos juegan un partido y quién
// es local/visita. La regla "exactamente 2 por partido" la enforcea un
// trigger diferido en la base.
export const partidoEquipo = metrics.table('partido_equipo', {
  id: uuid('id').primaryKey().defaultRandom(),
  partidoId: uuid('partido_id').notNull(),
  equipoId: uuid('equipo_id').notNull(),
  condicion: condicion('condicion').notNull(),
});
