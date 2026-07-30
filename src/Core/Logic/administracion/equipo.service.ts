import type { Equipo, NuevoEquipo } from '../dominio/equipo.js';
import { validarNuevoEquipo } from '../dominio/equipo.js';
import { ErrorValidacion, NoEncontrado } from '../../../shared/errors.js';

// Puerto: lo que el servicio necesita de la capa de datos. La
// implementación real (Drizzle) vive en Data/repos y cumple esta
// interfaz. Así el servicio no sabe nada de SQL y se puede probar
// contra un repo falso en memoria.
export interface EquipoRepo {
  listar(): Promise<Equipo[]>;
  obtener(id: string): Promise<Equipo | null>;
  crear(datos: NuevoEquipo): Promise<Equipo>;
  actualizar(id: string, cambios: Partial<NuevoEquipo>): Promise<Equipo | null>;
}

// Casos de uso del catálogo de equipos. Orquesta reglas de dominio +
// persistencia; no conoce HTTP.
export class EquipoService {
  constructor(private readonly repo: EquipoRepo) {}

  listar(): Promise<Equipo[]> {
    return this.repo.listar();
  }

  async obtener(id: string): Promise<Equipo> {
    const equipo = await this.repo.obtener(id);
    if (!equipo) throw new NoEncontrado('Equipo', id);
    return equipo;
  }

  async crear(datos: NuevoEquipo): Promise<Equipo> {
    const errores = validarNuevoEquipo(datos);
    if (errores.length) throw new ErrorValidacion(errores);
    return this.repo.crear(datos);
  }

  async actualizar(id: string, cambios: Partial<NuevoEquipo>): Promise<Equipo> {
    const actual = await this.obtener(id); // lanza NoEncontrado si no existe

    // Valida el resultado de aplicar los cambios sobre lo que ya hay.
    const propuesto: NuevoEquipo = {
      nombre: cambios.nombre ?? actual.nombre,
      corto: cambios.corto ?? actual.corto,
      categoria: cambios.categoria ?? actual.categoria,
      provincia: cambios.provincia ?? actual.provincia,
      sede: cambios.sede ?? actual.sede,
      color: cambios.color ?? actual.color,
      fundado: cambios.fundado ?? actual.fundado,
    };
    const errores = validarNuevoEquipo(propuesto);
    if (errores.length) throw new ErrorValidacion(errores);

    const actualizado = await this.repo.actualizar(id, cambios);
    if (!actualizado) throw new NoEncontrado('Equipo', id);
    return actualizado;
  }
}
