import type { Accion, NuevaAccion, AccionEntrante } from '../dominio/accion.js';
import { validarNuevaAccion, accionesVigentes } from '../dominio/accion.js';
import type { SetPartido, NuevoSet } from '../dominio/set-partido.js';
import { validarNuevoSet } from '../dominio/set-partido.js';
import type {
  Alineacion,
  NuevaAlineacion,
  JugadorAlineado,
  PosicionEnCancha,
} from '../dominio/alineacion.js';
import {
  validarAlineacion,
  rotacionActual,
  posicionesEnCancha,
} from '../dominio/alineacion.js';
import { ErrorValidacion, NoEncontrado } from '../../../shared/errors.js';

// Puerto append-only: registrar y leer, nada de editar/borrar.
export interface AccionRepo {
  anexar(datos: NuevaAccion): Promise<Accion>;
  listarPorSet(setId: string): Promise<Accion[]>;
}

export interface AlineacionRepo {
  // Reemplaza la alineación del equipo en ese set (se puede corregir
  // mientras el set siga abierto).
  declarar(setId: string, equipoId: string, jugadores: JugadorAlineado[]): Promise<Alineacion[]>;
  listarPorSet(setId: string): Promise<Alineacion[]>;
  // Un cambio: el que sale queda marcado y el que entra hereda su lugar
  // en el giro. Las dos cosas, juntas.
  sustituir(saleId: string, rally: number, entra: NuevaAlineacion): Promise<Alineacion>;
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
    private readonly alineaciones: AlineacionRepo,
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

  // La rotación se puede mandar, pero lo normal es omitirla: se deduce
  // de los puntos que lleva el set. Se guarda concreta en la acción
  // porque es el estado en el momento de capturarla.
  async registrarAccion(datos: AccionEntrante): Promise<Accion> {
    const set = await this.sets.obtener(datos.setId);
    if (!set) throw new NoEncontrado('Set', datos.setId);
    if (set.cerrado)
      throw new ErrorValidacion(['El set ya está cerrado; no admite más acciones.']);

    const completa: NuevaAccion = {
      ...datos,
      rotacion: datos.rotacion ?? (await this.rotacionDe(datos.setId, datos.equipoId)),
    };
    const errores = validarNuevaAccion(completa);
    if (errores.length) throw new ErrorValidacion(errores);

    return this.acciones.anexar(completa);
  }

  private async rotacionDe(setId: string, equipoId: string): Promise<number> {
    const vigentes = accionesVigentes(await this.acciones.listarPorSet(setId));
    return rotacionActual(equipoId, vigentes);
  }

  accionesDeSet(setId: string): Promise<Accion[]> {
    return this.acciones.listarPorSet(setId);
  }

  // Los 6 titulares con su posición de arranque (más el líbero, si hay).
  // Esa formación es, por definición, la rotación 1 del equipo en el set.
  async declararAlineacion(
    setId: string,
    equipoId: string,
    jugadores: JugadorAlineado[],
  ): Promise<Alineacion[]> {
    const set = await this.obtenerSet(setId);
    if (set.cerrado) throw new ErrorValidacion(['El set ya está cerrado.']);

    const errores = validarAlineacion(jugadores);
    if (errores.length) throw new ErrorValidacion(errores);

    return this.alineaciones.declarar(setId, equipoId, jugadores);
  }

  alineacionDeSet(setId: string): Promise<Alineacion[]> {
    return this.alineaciones.listarPorSet(setId);
  }

  // Un cambio: el que entra hereda la posición del que sale, porque lo
  // que gira es el lugar, no la persona.
  async sustituir(
    setId: string,
    equipoId: string,
    datos: { saleJugadorId: string; entraJugadorId: string; rally: number },
  ): Promise<Alineacion> {
    const set = await this.obtenerSet(setId);
    if (set.cerrado) throw new ErrorValidacion(['El set ya está cerrado.']);
    if (!Number.isInteger(datos.rally) || datos.rally < 1)
      throw new ErrorValidacion(['El rally del cambio debe ser un entero positivo.']);

    const alineacion = await this.alineaciones.listarPorSet(setId);
    const sale = alineacion.find(
      (a) =>
        a.equipoId === equipoId &&
        a.jugadorId === datos.saleJugadorId &&
        a.saleEnRally == null,
    );
    if (!sale) throw new ErrorValidacion(['El jugador que sale no está en cancha.']);
    if (alineacion.some((a) => a.jugadorId === datos.entraJugadorId))
      throw new ErrorValidacion([
        'Ese jugador ya figura en el set; el reingreso todavía no se modela.',
      ]);

    return this.alineaciones.sustituir(sale.id, datos.rally, {
      setId,
      equipoId,
      jugadorId: datos.entraJugadorId,
      rotacionInicial: sale.rotacionInicial,
      esLibero: sale.esLibero,
      entraEnRally: datos.rally,
      saleEnRally: null,
    });
  }

  // La foto de la cancha ahora mismo: en qué rotación va cada equipo y
  // dónde está parado cada quien. Es lo que la app de captura necesita
  // para mostrar la cancha en vez de pedir ids a mano.
  async cancha(setId: string): Promise<
    { equipoId: string; rally: number; rotacion: number; jugadores: PosicionEnCancha[] }[]
  > {
    await this.obtenerSet(setId);

    const vigentes = accionesVigentes(await this.acciones.listarPorSet(setId));
    const rally = vigentes.length ? Math.max(...vigentes.map((a) => a.rally)) : 1;
    const alineacion = await this.alineaciones.listarPorSet(setId);

    return [...new Set(alineacion.map((a) => a.equipoId))].map((equipoId) => {
      const rotacion = rotacionActual(equipoId, vigentes);
      const suya = alineacion.filter((a) => a.equipoId === equipoId);
      return { equipoId, rally, rotacion, jugadores: posicionesEnCancha(suya, rotacion, rally) };
    });
  }

  private async obtenerSet(setId: string): Promise<SetPartido> {
    const set = await this.sets.obtener(setId);
    if (!set) throw new NoEncontrado('Set', setId);
    return set;
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
