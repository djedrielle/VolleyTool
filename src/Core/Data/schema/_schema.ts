import { pgSchema } from 'drizzle-orm/pg-core';

// Todo el MVP vive en el esquema `metrics` de Postgres. Un solo lugar
// declara el esquema y los enums compartidos, para no repetirlos en
// cada tabla. Deben calcar los CREATE TYPE de db_scripts/001_*.sql.
export const metrics = pgSchema('metrics');

export const categoria = metrics.enum('categoria', ['femenino', 'masculino']);
export const posicion = metrics.enum('posicion', [
  'armador',
  'opuesto',
  'central',
  'punta',
  'libero',
]);
export const condicion = metrics.enum('condicion', ['casa', 'visita']);
export const estadoPartido = metrics.enum('estado_partido', [
  'programado',
  'en_vivo',
  'finalizado',
  'suspendido',
]);
export const lateralidad = metrics.enum('lateralidad', [
  'derecha',
  'izquierda',
  'ambidiestro',
]);
