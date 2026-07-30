import { uuid, text, smallint, date, timestamp } from 'drizzle-orm/pg-core';
import { metrics, lateralidad } from './_schema.js';

// Calca metrics.jugador de db_scripts/001_*.sql.
export const jugador = metrics.table('jugador', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  apellido1: text('apellido1').notNull(),
  apellido2: text('apellido2'),
  cedula: text('cedula').unique(),
  fechaNacimiento: date('fecha_nacimiento').notNull(),
  nacionalidad: text('nacionalidad').notNull().default('Costa Rica'),
  tipoSangre: text('tipo_sangre'),
  lateralidad: lateralidad('lateralidad'),
  alturaCm: smallint('altura_cm'),
  pesoKg: smallint('peso_kg'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
});
