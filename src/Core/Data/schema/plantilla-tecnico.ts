import { uuid, text } from 'drizzle-orm/pg-core';
import { metrics } from './_schema.js';

// Calca metrics.plantilla_tecnico. FKs y UNIQUE(cuerpo_tecnico, equipo,
// torneo) los enforcea la base.
export const plantillaTecnico = metrics.table('plantilla_tecnico', {
  id: uuid('id').primaryKey().defaultRandom(),
  cuerpoTecnicoId: uuid('cuerpo_tecnico_id').notNull(),
  equipoId: uuid('equipo_id').notNull(),
  torneoId: uuid('torneo_id').notNull(),
  rol: text('rol').notNull(),
});
