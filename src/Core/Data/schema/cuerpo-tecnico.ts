import { uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { metrics } from './_schema.js';

// Calca metrics.cuerpo_tecnico de db_scripts/001_*.sql.
export const cuerpoTecnico = metrics.table('cuerpo_tecnico', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  apellido1: text('apellido1').notNull(),
  apellido2: text('apellido2'),
  nacionalidad: text('nacionalidad').notNull().default('Costa Rica'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
});
