import { LATERALIDADES, type Lateralidad } from './comunes.js';

// Ficha personal del jugador. Sin número, posición ni equipo: eso es de
// la inscripción (plantilla), no de la persona.
export interface Jugador {
  id: string;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  cedula: string | null;
  fechaNacimiento: string; // YYYY-MM-DD
  nacionalidad: string;
  tipoSangre: string | null;
  lateralidad: Lateralidad | null;
  alturaCm: number | null;
  pesoKg: number | null;
  creadoEn: Date;
}

export interface NuevoJugador {
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
  cedula?: string | null;
  fechaNacimiento: string;
  nacionalidad?: string;
  tipoSangre?: string | null;
  lateralidad?: Lateralidad | null;
  alturaCm?: number | null;
  pesoKg?: number | null;
}

export function validarNuevoJugador(j: NuevoJugador): string[] {
  const errores: string[] = [];
  if (!j.nombre?.trim()) errores.push('El nombre es obligatorio.');
  if (!j.apellido1?.trim()) errores.push('El primer apellido es obligatorio.');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(j.fechaNacimiento ?? '')) {
    errores.push('La fecha de nacimiento debe tener formato YYYY-MM-DD.');
  } else {
    const f = new Date(j.fechaNacimiento);
    if (Number.isNaN(f.getTime()) || f > new Date())
      errores.push('La fecha de nacimiento no es válida.');
  }

  if (j.lateralidad != null && !LATERALIDADES.includes(j.lateralidad))
    errores.push('La lateralidad no es válida.');
  if (j.alturaCm != null && (j.alturaCm < 120 || j.alturaCm > 250))
    errores.push('La altura debe estar entre 120 y 250 cm.');
  if (j.pesoKg != null && (j.pesoKg < 30 || j.pesoKg > 200))
    errores.push('El peso debe estar entre 30 y 200 kg.');

  return errores;
}
