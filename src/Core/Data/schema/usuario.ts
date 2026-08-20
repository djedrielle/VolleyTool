import { uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { metrics, rol } from './_schema.js';

// Calca metrics.usuario. El hash de la contraseña lo calcula la app; acá
// solo se guarda. `alcance` es el equipo al que se limita un capturador.
export const usuario = metrics.table('usuario', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  hashContrasena: text('hash_contrasena').notNull(),
  rol: rol('rol').notNull().default('usuario_normal'),
  alcance: uuid('alcance'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
});
