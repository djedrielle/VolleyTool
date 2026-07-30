import type { Torneo, NuevoTorneo } from '../dominio/torneo.js';
import { validarNuevoTorneo } from '../dominio/torneo.js';
import { ErrorValidacion, NoEncontrado } from '../../../shared/errors.js';

export interface TorneoRepo {
  listar(): Promise<Torneo[]>;
  obtener(id: string): Promise<Torneo | null>;
  crear(datos: NuevoTorneo): Promise<Torneo>;
  actualizar(id: string, cambios: Partial<NuevoTorneo>): Promise<Torneo | null>;
}

export class TorneoService {
  constructor(private readonly repo: TorneoRepo) {}

  listar(): Promise<Torneo[]> {
    return this.repo.listar();
  }

  async obtener(id: string): Promise<Torneo> {
    const torneo = await this.repo.obtener(id);
    if (!torneo) throw new NoEncontrado('Torneo', id);
    return torneo;
  }

  async crear(datos: NuevoTorneo): Promise<Torneo> {
    const errores = validarNuevoTorneo(datos);
    if (errores.length) throw new ErrorValidacion(errores);
    return this.repo.crear(datos);
  }

  async actualizar(id: string, cambios: Partial<NuevoTorneo>): Promise<Torneo> {
    const actual = await this.obtener(id);
    const propuesto: NuevoTorneo = {
      nombre: cambios.nombre ?? actual.nombre,
      temporada: cambios.temporada ?? actual.temporada,
      categoria: cambios.categoria ?? actual.categoria,
      fechaInicio: cambios.fechaInicio ?? actual.fechaInicio,
      fechaFin: cambios.fechaFin ?? actual.fechaFin,
      formato: cambios.formato ?? actual.formato,
    };
    const errores = validarNuevoTorneo(propuesto);
    if (errores.length) throw new ErrorValidacion(errores);

    const actualizado = await this.repo.actualizar(id, cambios);
    if (!actualizado) throw new NoEncontrado('Torneo', id);
    return actualizado;
  }
}
