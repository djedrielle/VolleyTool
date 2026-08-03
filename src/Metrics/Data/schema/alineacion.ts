import { uuid, smallint, boolean } from 'drizzle-orm/pg-core';
import { metrics } from './_schema.js';

// Calca metrics.alineacion: una fila por jugador y set. `posicion_inicial`
// es la zona 1..6 con la que arranca (null en el líbero), `es_armador`
// marca al que ancla el número de rotación, y los rallies de entrada y
// salida registran los cambios.
export const alineacion = metrics.table('alineacion', {
  id: uuid('id').primaryKey().defaultRandom(),
  setId: uuid('set_id').notNull(),
  equipoId: uuid('equipo_id').notNull(),
  jugadorId: uuid('jugador_id').notNull(),
  posicionInicial: smallint('posicion_inicial'),
  esArmador: boolean('es_armador').notNull().default(false),
  esLibero: boolean('es_libero').notNull().default(false),
  entraEnRally: smallint('entra_en_rally'),
  saleEnRally: smallint('sale_en_rally'),
});
