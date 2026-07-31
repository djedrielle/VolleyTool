import { pgSchema } from 'drizzle-orm/pg-core';

// Metrics declara su propia vista del esquema `metrics` de Postgres y sus
// enums, sin importar nada de Core: así los dominios no se acoplan por el
// código aunque en el MVP compartan la misma base.
export const metrics = pgSchema('metrics');

export const tipoAccion = metrics.enum('tipo_accion', [
  'saque',
  'recepcion',
  'colocacion',
  'ataque',
  'bloqueo',
  'defensa',
]);

export const resultadoAccion = metrics.enum('resultado_accion', [
  'ace',
  'recibido',
  'perfecta',
  'fuera_sistema',
  'ok',
  'punto_directo',
  'defendido',
  'exitosa',
  'error',
]);
