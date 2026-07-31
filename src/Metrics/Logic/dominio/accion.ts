// El corazón de Metrics: la acción capturada. Código puro (sin HTTP ni
// SQL). Los tipos y las reglas espejan el esquema `accion`, pero acá se
// pueden probar sin base de datos.

export type TipoAccion = 'saque' | 'recepcion' | 'colocacion' | 'ataque' | 'bloqueo' | 'defensa';

export type Resultado =
  | 'ace'
  | 'recibido'
  | 'perfecta'
  | 'fuera_sistema'
  | 'ok'
  | 'punto_directo'
  | 'defendido'
  | 'exitosa'
  | 'error';

// Qué resultados admite cada tipo. Espeja el CHECK resultado_valido_para_tipo
// del esquema SQL, en un solo lugar reutilizable.
export const RESULTADOS_POR_TIPO: Record<TipoAccion, readonly Resultado[]> = {
  saque: ['ace', 'recibido', 'error'],
  recepcion: ['perfecta', 'fuera_sistema', 'error'],
  colocacion: ['ok', 'error'],
  ataque: ['punto_directo', 'defendido', 'error'],
  bloqueo: ['punto_directo', 'defendido', 'error'],
  defensa: ['exitosa', 'error'],
};

// La acción tal como queda registrada. `puntoParaEquipoId` nulo = el rally
// sigue; con valor = esta acción cerró el rally y el punto fue para ese
// equipo. `corrigeAccionId` apunta a la acción que esta corrige (por ahora
// siempre null; las correcciones/undo llegan en la rebanada del proyector).
export interface Accion {
  id: string;
  setId: string;
  equipoId: string;
  jugadorId: string;
  rally: number;
  ordenEnRally: number;
  rotacion: number;
  tipo: TipoAccion;
  resultado: Resultado;
  puntoParaEquipoId: string | null;
  corrigeAccionId: string | null;
  registradoEn: Date;
  registradoPor: string | null;
}

export interface NuevaAccion {
  setId: string;
  equipoId: string;
  jugadorId: string;
  rally: number;
  ordenEnRally: number;
  rotacion: number;
  tipo: TipoAccion;
  resultado: Resultado;
  puntoParaEquipoId?: string | null;
  registradoPor?: string | null;
}

export function validarNuevaAccion(a: NuevaAccion): string[] {
  const errores: string[] = [];
  if (!a.setId) errores.push('El set es obligatorio.');
  if (!a.equipoId) errores.push('El equipo es obligatorio.');
  if (!a.jugadorId) errores.push('El jugador es obligatorio.');
  if (!Number.isInteger(a.rally) || a.rally < 1)
    errores.push('El rally debe ser un entero positivo.');
  if (!Number.isInteger(a.ordenEnRally) || a.ordenEnRally < 1)
    errores.push('El orden en el rally debe ser un entero positivo.');
  if (!Number.isInteger(a.rotacion) || a.rotacion < 1 || a.rotacion > 6)
    errores.push('La rotación debe estar entre 1 y 6.');

  const validos = RESULTADOS_POR_TIPO[a.tipo];
  if (!validos) errores.push('El tipo de acción no es válido.');
  else if (!validos.includes(a.resultado))
    errores.push(`El resultado "${a.resultado}" no es válido para un ${a.tipo}.`);

  return errores;
}
