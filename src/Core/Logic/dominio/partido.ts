import { ESTADOS_PARTIDO, type EstadoPartido } from './comunes.js';

// El partido tal como se lee: incluye sus dos equipos (derivados de
// partido_equipo) para no tener que ir a buscarlos aparte.
export interface Partido {
  id: string;
  torneoId: string;
  jornada: number | null;
  fechaHora: string; // ISO 8601
  sede: string | null;
  estado: EstadoPartido;
  creadoEn: Date;
  equipoLocalId: string;
  equipoVisitaId: string;
}

// Para programar un partido: los dos equipos van juntos porque un
// partido no existe sin sus dos participantes (regla "exactamente 2").
export interface NuevoPartido {
  torneoId: string;
  jornada?: number | null;
  fechaHora: string;
  sede?: string | null;
  estado?: EstadoPartido;
  equipoLocalId: string;
  equipoVisitaId: string;
}

// Al editar no se cambian los equipos, solo los datos del encuentro.
export interface CambiosPartido {
  jornada?: number | null;
  fechaHora?: string;
  sede?: string | null;
  estado?: EstadoPartido;
}

export function validarNuevoPartido(p: NuevoPartido): string[] {
  const errores: string[] = [];
  if (!p.torneoId) errores.push('El torneo es obligatorio.');
  if (!p.fechaHora) errores.push('La fecha y hora son obligatorias.');
  if (!p.equipoLocalId || !p.equipoVisitaId)
    errores.push('Se requieren los dos equipos (local y visita).');
  else if (p.equipoLocalId === p.equipoVisitaId)
    errores.push('Un equipo no puede jugar contra sí mismo.');
  if (p.estado != null && !ESTADOS_PARTIDO.includes(p.estado))
    errores.push('El estado no es válido.');
  return errores;
}
