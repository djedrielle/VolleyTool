// Enums de dominio compartidos por varias entidades de Core. Son el
// espejo en TypeScript de los enums del esquema (Data/schema/_schema.ts),
// pero del lado de la lógica: puros, sin dependencia de Drizzle.

export type Categoria = 'femenino' | 'masculino';
export const CATEGORIAS: readonly Categoria[] = ['femenino', 'masculino'];

export type Posicion = 'armador' | 'opuesto' | 'central' | 'punta' | 'libero';
export const POSICIONES: readonly Posicion[] = [
  'armador',
  'opuesto',
  'central',
  'punta',
  'libero',
];

export type Lateralidad = 'derecha' | 'izquierda' | 'ambidiestro';
export const LATERALIDADES: readonly Lateralidad[] = ['derecha', 'izquierda', 'ambidiestro'];

export type CondicionLocalVisita = 'casa' | 'visita';

export type EstadoPartido = 'programado' | 'en_vivo' | 'finalizado' | 'suspendido';
export const ESTADOS_PARTIDO: readonly EstadoPartido[] = [
  'programado',
  'en_vivo',
  'finalizado',
  'suspendido',
];
