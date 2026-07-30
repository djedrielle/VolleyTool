import { uuid, text, smallint, timestamp } from 'drizzle-orm/pg-core';
import { metrics, estadoPartido } from './_schema.js';

// Calca metrics.partido. La FK a torneo la enforcea la base (no se
// declara acá para no acoplar los archivos de schema entre sí).
export const partido = metrics.table('partido', {
  id: uuid('id').primaryKey().defaultRandom(),
  torneoId: uuid('torneo_id').notNull(),
  jornada: smallint('jornada'),
  fechaHora: timestamp('fecha_hora', { withTimezone: true, mode: 'string' }).notNull(),
  sede: text('sede'),
  estado: estadoPartido('estado').notNull().default('programado'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
});
