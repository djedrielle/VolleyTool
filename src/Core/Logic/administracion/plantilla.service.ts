import type { Plantilla, NuevaPlantilla } from '../dominio/plantilla.js';
import { validarNuevaPlantilla } from '../dominio/plantilla.js';
import { ErrorValidacion, NoEncontrado } from '../../../shared/errors.js';

export interface PlantillaRepo {
  listar(): Promise<Plantilla[]>;
  obtener(id: string): Promise<Plantilla | null>;
  crear(datos: NuevaPlantilla): Promise<Plantilla>;
  actualizar(id: string, cambios: Partial<NuevaPlantilla>): Promise<Plantilla | null>;
}

export class PlantillaService {
  constructor(private readonly repo: PlantillaRepo) {}

  listar(): Promise<Plantilla[]> {
    return this.repo.listar();
  }

  async obtener(id: string): Promise<Plantilla> {
    const plantilla = await this.repo.obtener(id);
    if (!plantilla) throw new NoEncontrado('Plantilla', id);
    return plantilla;
  }

  async crear(datos: NuevaPlantilla): Promise<Plantilla> {
    const errores = validarNuevaPlantilla(datos);
    if (errores.length) throw new ErrorValidacion(errores);
    return this.repo.crear(datos);
  }

  async actualizar(id: string, cambios: Partial<NuevaPlantilla>): Promise<Plantilla> {
    const actual = await this.obtener(id);
    const propuesto: NuevaPlantilla = {
      jugadorId: cambios.jugadorId ?? actual.jugadorId,
      equipoId: cambios.equipoId ?? actual.equipoId,
      torneoId: cambios.torneoId ?? actual.torneoId,
      numero: cambios.numero ?? actual.numero,
      posicion: cambios.posicion ?? actual.posicion,
      esCapitan: cambios.esCapitan ?? actual.esCapitan,
      desde: cambios.desde ?? actual.desde,
      hasta: cambios.hasta ?? actual.hasta,
    };
    const errores = validarNuevaPlantilla(propuesto);
    if (errores.length) throw new ErrorValidacion(errores);

    const actualizado = await this.repo.actualizar(id, cambios);
    if (!actualizado) throw new NoEncontrado('Plantilla', id);
    return actualizado;
  }
}
