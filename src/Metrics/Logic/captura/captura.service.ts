import type { Accion, NuevaAccion } from '../dominio/accion.js';
import { validarNuevaAccion } from '../dominio/accion.js';
import type { SetPartido, NuevoSet } from '../dominio/set-partido.js';
import { validarNuevoSet } from '../dominio/set-partido.js';
import { ErrorValidacion, NoEncontrado } from '../../../shared/errors.js';

// Puerto append-only: registrar y leer, nada de editar/borrar.
export interface AccionRepo {
  anexar(datos: NuevaAccion): Promise<Accion>;
  listarPorSet(setId: string): Promise<Accion[]>;
}

export interface SetPartidoRepo {
  crear(datos: NuevoSet): Promise<SetPartido>;
  obtener(id: string): Promise<SetPartido | null>;
  listarPorPartido(partidoId: string): Promise<SetPartido[]>;
}

// Camino de escritura: conduce el partido en vivo. Solo escribe la verdad
// cruda (abre sets, anexa acciones); no calcula estadísticas.
export class CapturaService {
  constructor(
    private readonly acciones: AccionRepo,
    private readonly sets: SetPartidoRepo,
  ) {}

  async abrirSet(datos: NuevoSet): Promise<SetPartido> {
    const errores = validarNuevoSet(datos);
    if (errores.length) throw new ErrorValidacion(errores);
    return this.sets.crear(datos);
  }

  setsDePartido(partidoId: string): Promise<SetPartido[]> {
    return this.sets.listarPorPartido(partidoId);
  }

  async registrarAccion(datos: NuevaAccion): Promise<Accion> {
    const errores = validarNuevaAccion(datos);
    if (errores.length) throw new ErrorValidacion(errores);

    const set = await this.sets.obtener(datos.setId);
    if (!set) throw new NoEncontrado('Set', datos.setId);
    if (set.cerrado)
      throw new ErrorValidacion(['El set ya está cerrado; no admite más acciones.']);

    return this.acciones.anexar(datos);
  }

  accionesDeSet(setId: string): Promise<Accion[]> {
    return this.acciones.listarPorSet(setId);
  }
}
