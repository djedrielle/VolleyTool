import { uuid, text, smallint, timestamp } from 'drizzle-orm/pg-core';
import { metrics, categoria } from './_schema.js';

// Calca metrics.equipo de db_scripts/001_crear_esquema_metrics.sql.
export const equipo = metrics.table('equipo', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull().unique(),
  corto: text('corto').notNull(),
  categoria: categoria('categoria').notNull(),
  provincia: text('provincia'),
  sede: text('sede'),
  color: text('color'),
  fundado: smallint('fundado'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
});
