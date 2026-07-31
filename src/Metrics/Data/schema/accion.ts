import { uuid, smallint, timestamp } from 'drizzle-orm/pg-core';
import { metrics, tipoAccion, resultadoAccion } from './_schema.js';

// Calca metrics.accion (la fuente de verdad append-only). Las FK y los
// CHECK (resultado-por-tipo, rangos) los enforcea la base; el trigger
// impide UPDATE/DELETE.
export const accion = metrics.table('accion', {
  id: uuid('id').primaryKey().defaultRandom(),
  setId: uuid('set_id').notNull(),
  equipoId: uuid('equipo_id').notNull(),
  jugadorId: uuid('jugador_id').notNull(),
  rally: smallint('rally').notNull(),
  ordenEnRally: smallint('orden_en_rally').notNull(),
  rotacion: smallint('rotacion').notNull(),
  tipo: tipoAccion('tipo').notNull(),
  resultado: resultadoAccion('resultado').notNull(),
  puntoParaEquipoId: uuid('punto_para_equipo_id'),
  corrigeAccionId: uuid('corrige_accion_id'),
  registradoEn: timestamp('registrado_en', { withTimezone: true }).notNull().defaultNow(),
  registradoPor: uuid('registrado_por'),
});
