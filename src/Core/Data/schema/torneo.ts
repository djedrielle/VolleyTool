import { uuid, text, smallint, date, timestamp } from 'drizzle-orm/pg-core';
import { metrics, categoria } from './_schema.js';

// Calca metrics.torneo de db_scripts/001_*.sql.
export const torneo = metrics.table('torneo', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  temporada: smallint('temporada').notNull(),
  categoria: categoria('categoria').notNull(),
  fechaInicio: date('fecha_inicio'),
  fechaFin: date('fecha_fin'),
  formato: text('formato'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
});
