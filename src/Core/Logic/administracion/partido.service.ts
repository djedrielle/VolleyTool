import type { Partido, NuevoPartido, CambiosPartido } from '../dominio/partido.js';
import { validarNuevoPartido } from '../dominio/partido.js';
import { ESTADOS_PARTIDO } from '../dominio/comunes.js';
import { ErrorValidacion, NoEncontrado } from '../../../shared/errors.js';

export interface PartidoRepo {
  listar(): Promise<Partido[]>;
  obtener(id: string): Promise<Partido | null>;
  // Inserta el partido y sus dos equipos juntos (transacción en el repo).
  crear(datos: NuevoPartido): Promise<Partido>;
  actualizar(id: string, cambios: CambiosPartido): Promise<Partido | null>;
}

export class PartidoService {
  constructor(private readonly repo: PartidoRepo) {}

  listar(): Promise<Partido[]> {
    return this.repo.listar();
  }

  async obtener(id: string): Promise<Partido> {
    const partido = await this.repo.obtener(id);
    if (!partido) throw new NoEncontrado('Partido', id);
    return partido;
  }

  async crear(datos: NuevoPartido): Promise<Partido> {
    const errores = validarNuevoPartido(datos);
    if (errores.length) throw new ErrorValidacion(errores);
    return this.repo.crear(datos);
  }

  async actualizar(id: string, cambios: CambiosPartido): Promise<Partido> {
    await this.obtener(id); // 404 si no existe
    if (cambios.estado != null && !ESTADOS_PARTIDO.includes(cambios.estado))
      throw new ErrorValidacion(['El estado no es válido.']);

    const actualizado = await this.repo.actualizar(id, cambios);
    if (!actualizado) throw new NoEncontrado('Partido', id);
    return actualizado;
  }
}
