// El set dentro de un partido. El marcador (puntos) y el cierre viven acá;
// las acciones del set son la fuente de verdad de lo que pasó dentro.
export interface SetPartido {
  id: string;
  partidoId: string;
  numero: number;
  puntosCasa: number;
  puntosVisita: number;
  cerrado: boolean;
}

export interface NuevoSet {
  partidoId: string;
  numero: number;
}

export function validarNuevoSet(s: NuevoSet): string[] {
  const errores: string[] = [];
  if (!s.partidoId) errores.push('El partido es obligatorio.');
  if (!Number.isInteger(s.numero) || s.numero < 1 || s.numero > 5)
    errores.push('El número de set debe estar entre 1 y 5.');
  return errores;
}
