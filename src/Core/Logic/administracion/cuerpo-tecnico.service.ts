import type { CuerpoTecnico, NuevoCuerpoTecnico } from '../dominio/cuerpo-tecnico.js';
import { validarNuevoCuerpoTecnico } from '../dominio/cuerpo-tecnico.js';
import { ErrorValidacion, NoEncontrado } from '../../../shared/errors.js';

export interface CuerpoTecnicoRepo {
  listar(): Promise<CuerpoTecnico[]>;
  obtener(id: string): Promise<CuerpoTecnico | null>;
  crear(datos: NuevoCuerpoTecnico): Promise<CuerpoTecnico>;
  actualizar(id: string, cambios: Partial<NuevoCuerpoTecnico>): Promise<CuerpoTecnico | null>;
}

export class CuerpoTecnicoService {
  constructor(private readonly repo: CuerpoTecnicoRepo) {}

  listar(): Promise<CuerpoTecnico[]> {
    return this.repo.listar();
  }

  async obtener(id: string): Promise<CuerpoTecnico> {
    const ct = await this.repo.obtener(id);
    if (!ct) throw new NoEncontrado('Cuerpo técnico', id);
    return ct;
  }

  async crear(datos: NuevoCuerpoTecnico): Promise<CuerpoTecnico> {
    const errores = validarNuevoCuerpoTecnico(datos);
    if (errores.length) throw new ErrorValidacion(errores);
    return this.repo.crear(datos);
  }

  async actualizar(id: string, cambios: Partial<NuevoCuerpoTecnico>): Promise<CuerpoTecnico> {
    const actual = await this.obtener(id);
    const propuesto: NuevoCuerpoTecnico = {
      nombre: cambios.nombre ?? actual.nombre,
      apellido1: cambios.apellido1 ?? actual.apellido1,
      apellido2: cambios.apellido2 ?? actual.apellido2,
      nacionalidad: cambios.nacionalidad ?? actual.nacionalidad,
    };
    const errores = validarNuevoCuerpoTecnico(propuesto);
    if (errores.length) throw new ErrorValidacion(errores);

    const actualizado = await this.repo.actualizar(id, cambios);
    if (!actualizado) throw new NoEncontrado('Cuerpo técnico', id);
    return actualizado;
  }
}
