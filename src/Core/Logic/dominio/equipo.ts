// Tipos y reglas del equipo. Código puro: sin HTTP, sin SQL. Es lo que
// se traduciría casi tal cual a Rust el día de una migración.

import { CATEGORIAS, type Categoria } from './comunes.js';

// El equipo tal como existe (con id y fecha de creación de la base).
export interface Equipo {
  id: string;
  nombre: string;
  corto: string;
  categoria: Categoria;
  provincia: string | null;
  sede: string | null;
  color: string | null;
  fundado: number | null;
  creadoEn: Date;
}

// Datos para crear un equipo: sin id ni creadoEn, que los pone la base.
export interface NuevoEquipo {
  nombre: string;
  corto: string;
  categoria: Categoria;
  provincia?: string | null;
  sede?: string | null;
  color?: string | null;
  fundado?: number | null;
}

// Reglas de dominio. Devuelve la lista de errores (vacía = válido).
// Refleja los CHECK del esquema SQL, pero acá se pueden probar sin base.
export function validarNuevoEquipo(e: NuevoEquipo): string[] {
  const errores: string[] = [];
  if (!e.nombre?.trim()) errores.push('El nombre es obligatorio.');
  if (!e.corto || e.corto.length < 2 || e.corto.length > 4)
    errores.push('El código corto debe tener entre 2 y 4 caracteres.');
  if (!CATEGORIAS.includes(e.categoria))
    errores.push('La categoría debe ser femenino o masculino.');
  if (e.fundado != null && (e.fundado < 1900 || e.fundado > new Date().getFullYear()))
    errores.push('El año de fundación no es válido.');
  return errores;
}
