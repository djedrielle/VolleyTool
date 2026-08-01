import { uuid, smallint, boolean } from 'drizzle-orm/pg-core';
import { metrics } from './_schema.js';

// Calca metrics.alineacion: una fila por jugador y set. `rotacion_inicial`
// es la posición 1..6 con la que arranca (null en el líbero), y los
// rallies de entrada/salida registran los cambios.
export const alineacion = metrics.table('alineacion', {
  id: uuid('id').primaryKey().defaultRandom(),
  setId: uuid('set_id').notNull(),
  equipoId: uuid('equipo_id').notNull(),
  jugadorId: uuid('jugador_id').notNull(),
  rotacionInicial: smallint('rotacion_inicial'),
  esLibero: boolean('es_libero').notNull().default(false),
  entraEnRally: smallint('entra_en_rally'),
  saleEnRally: smallint('sale_en_rally'),
});
