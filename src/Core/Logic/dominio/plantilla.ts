import { POSICIONES, type Posicion } from './comunes.js';

// Inscripción de un jugador en un equipo para un torneo. Acá viven el
// número de camiseta y la posición (que son de la inscripción, no de
// la persona).
export interface Plantilla {
  id: string;
  jugadorId: string;
  equipoId: string;
  torneoId: string;
  numero: number;
  posicion: Posicion;
  esCapitan: boolean;
  desde: string | null; // YYYY-MM-DD
  hasta: string | null;
}

export interface NuevaPlantilla {
  jugadorId: string;
  equipoId: string;
  torneoId: string;
  numero: number;
  posicion: Posicion;
  esCapitan?: boolean;
  desde?: string | null;
  hasta?: string | null;
}

export function validarNuevaPlantilla(p: NuevaPlantilla): string[] {
  const errores: string[] = [];
  if (!p.jugadorId) errores.push('El jugador es obligatorio.');
  if (!p.equipoId) errores.push('El equipo es obligatorio.');
  if (!p.torneoId) errores.push('El torneo es obligatorio.');
  if (!Number.isInteger(p.numero) || p.numero < 1 || p.numero > 99)
    errores.push('El número debe estar entre 1 y 99.');
  if (!POSICIONES.includes(p.posicion)) errores.push('La posición no es válida.');
  if (p.desde && p.hasta && p.hasta < p.desde)
    errores.push('La fecha de fin no puede ser anterior a la de inicio.');
  return errores;
}
