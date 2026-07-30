import type { PlantillaTecnico, NuevaPlantillaTecnico } from '../dominio/plantilla-tecnico.js';
import { validarNuevaPlantillaTecnico } from '../dominio/plantilla-tecnico.js';
import { ErrorValidacion, NoEncontrado } from '../../../shared/errors.js';

export interface PlantillaTecnicoRepo {
  listar(): Promise<PlantillaTecnico[]>;
  obtener(id: string): Promise<PlantillaTecnico | null>;
  crear(datos: NuevaPlantillaTecnico): Promise<PlantillaTecnico>;
  actualizar(
    id: string,
    cambios: Partial<NuevaPlantillaTecnico>,
  ): Promise<PlantillaTecnico | null>;
}

export class PlantillaTecnicoService {
  constructor(private readonly repo: PlantillaTecnicoRepo) {}

  listar(): Promise<PlantillaTecnico[]> {
    return this.repo.listar();
  }

  async obtener(id: string): Promise<PlantillaTecnico> {
    const pt = await this.repo.obtener(id);
    if (!pt) throw new NoEncontrado('Plantilla técnica', id);
    return pt;
  }

  async crear(datos: NuevaPlantillaTecnico): Promise<PlantillaTecnico> {
    const errores = validarNuevaPlantillaTecnico(datos);
    if (errores.length) throw new ErrorValidacion(errores);
    return this.repo.crear(datos);
  }

  async actualizar(
    id: string,
    cambios: Partial<NuevaPlantillaTecnico>,
  ): Promise<PlantillaTecnico> {
    const actual = await this.obtener(id);
    const propuesto: NuevaPlantillaTecnico = {
      cuerpoTecnicoId: cambios.cuerpoTecnicoId ?? actual.cuerpoTecnicoId,
      equipoId: cambios.equipoId ?? actual.equipoId,
      torneoId: cambios.torneoId ?? actual.torneoId,
      rol: cambios.rol ?? actual.rol,
    };
    const errores = validarNuevaPlantillaTecnico(propuesto);
    if (errores.length) throw new ErrorValidacion(errores);

    const actualizado = await this.repo.actualizar(id, cambios);
    if (!actualizado) throw new NoEncontrado('Plantilla técnica', id);
    return actualizado;
  }
}
