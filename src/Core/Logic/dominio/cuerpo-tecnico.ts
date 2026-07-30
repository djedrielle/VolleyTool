// Miembro del cuerpo técnico (persona). Su rol en un equipo/torneo vive
// en la inscripción (plantilla_tecnico), no acá.
export interface CuerpoTecnico {
  id: string;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  nacionalidad: string;
  creadoEn: Date;
}

export interface NuevoCuerpoTecnico {
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
  nacionalidad?: string;
}

export function validarNuevoCuerpoTecnico(c: NuevoCuerpoTecnico): string[] {
  const errores: string[] = [];
  if (!c.nombre?.trim()) errores.push('El nombre es obligatorio.');
  if (!c.apellido1?.trim()) errores.push('El primer apellido es obligatorio.');
  return errores;
}
