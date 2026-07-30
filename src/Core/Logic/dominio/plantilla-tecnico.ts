// Inscripción de un miembro del cuerpo técnico en un equipo para un
// torneo, con su rol (entrenador, asistente, etc.).
export interface PlantillaTecnico {
  id: string;
  cuerpoTecnicoId: string;
  equipoId: string;
  torneoId: string;
  rol: string;
}

export interface NuevaPlantillaTecnico {
  cuerpoTecnicoId: string;
  equipoId: string;
  torneoId: string;
  rol: string;
}

export function validarNuevaPlantillaTecnico(p: NuevaPlantillaTecnico): string[] {
  const errores: string[] = [];
  if (!p.cuerpoTecnicoId) errores.push('El miembro del cuerpo técnico es obligatorio.');
  if (!p.equipoId) errores.push('El equipo es obligatorio.');
  if (!p.torneoId) errores.push('El torneo es obligatorio.');
  if (!p.rol?.trim()) errores.push('El rol es obligatorio.');
  return errores;
}
