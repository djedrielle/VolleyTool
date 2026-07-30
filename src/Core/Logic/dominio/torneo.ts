import { CATEGORIAS, type Categoria } from './comunes.js';

export interface Torneo {
  id: string;
  nombre: string;
  temporada: number;
  categoria: Categoria;
  fechaInicio: string | null; // YYYY-MM-DD
  fechaFin: string | null;
  formato: string | null;
  creadoEn: Date;
}

export interface NuevoTorneo {
  nombre: string;
  temporada: number;
  categoria: Categoria;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  formato?: string | null;
}

export function validarNuevoTorneo(t: NuevoTorneo): string[] {
  const errores: string[] = [];
  if (!t.nombre?.trim()) errores.push('El nombre es obligatorio.');
  if (!Number.isInteger(t.temporada) || t.temporada < 2000 || t.temporada > 2100)
    errores.push('La temporada no es válida.');
  if (!CATEGORIAS.includes(t.categoria))
    errores.push('La categoría debe ser femenino o masculino.');
  if (t.fechaInicio && t.fechaFin && t.fechaFin < t.fechaInicio)
    errores.push('La fecha de fin no puede ser anterior a la de inicio.');
  return errores;
}
