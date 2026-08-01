import type { Accion, NuevaAccion } from '../dominio/accion.js';
import { validarNuevaAccion, accionesVigentes } from '../dominio/accion.js';
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
  cerrar(
    id: string,
    marcador: { puntosCasa: number; puntosVisita: number },
  ): Promise<SetPartido | null>;
}

// La captura dispara la proyección al cerrar el set (la flecha
// captura → proyeccion del diseño). Solo necesita esa capacidad.
export interface Proyector {
  proyectarPartido(partidoId: string): Promise<unknown>;
}

// Camino de escritura: conduce el partido en vivo. Escribe la verdad
// cruda (abre sets, anexa acciones, deshace) y, al cerrar, delega el
// cálculo al proyector.
export class CapturaService {
  constructor(
    private readonly acciones: AccionRepo,
    private readonly sets: SetPartidoRepo,
    private readonly proyector: Proyector,
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

  // Deshacer = anular la última acción vigente del set anexando una fila
  // que la referencia. No se edita ni se borra nada (append-only).
  async deshacer(setId: string, registradoPor: string | null): Promise<Accion> {
    const set = await this.sets.obtener(setId);
    if (!set) throw new NoEncontrado('Set', setId);
    if (set.cerrado) throw new ErrorValidacion(['El set está cerrado; no se puede deshacer.']);

    const vigentes = accionesVigentes(await this.acciones.listarPorSet(setId));
    const ultima = vigentes.at(-1);
    if (!ultima) throw new ErrorValidacion(['No hay acciones que deshacer en este set.']);

    return this.acciones.anexar({
      setId: ultima.setId,
      equipoId: ultima.equipoId,
      jugadorId: ultima.jugadorId,
      rally: ultima.rally,
      ordenEnRally: ultima.ordenEnRally,
      rotacion: ultima.rotacion,
      tipo: ultima.tipo,
      resultado: ultima.resultado,
      puntoParaEquipoId: ultima.puntoParaEquipoId,
      corrigeAccionId: ultima.id,
      registradoPor,
    });
  }

  // Cerrar el set: fija el marcador, lo marca cerrado y dispara el
  // proyector para recalcular los agregados del partido.
  async cerrarSet(
    setId: string,
    marcador: { puntosCasa?: number; puntosVisita?: number },
  ): Promise<SetPartido> {
    const set = await this.sets.obtener(setId);
    if (!set) throw new NoEncontrado('Set', setId);

    const cerrado = await this.sets.cerrar(setId, {
      puntosCasa: marcador.puntosCasa ?? set.puntosCasa,
      puntosVisita: marcador.puntosVisita ?? set.puntosVisita,
    });
    if (!cerrado) throw new NoEncontrado('Set', setId);

    await this.proyector.proyectarPartido(set.partidoId);
    return cerrado;
  }
}
