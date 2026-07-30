import type { Jugador, NuevoJugador } from '../dominio/jugador.js';
import { validarNuevoJugador } from '../dominio/jugador.js';
import { ErrorValidacion, NoEncontrado } from '../../../shared/errors.js';

export interface JugadorRepo {
  listar(): Promise<Jugador[]>;
  obtener(id: string): Promise<Jugador | null>;
  crear(datos: NuevoJugador): Promise<Jugador>;
  actualizar(id: string, cambios: Partial<NuevoJugador>): Promise<Jugador | null>;
}

export class JugadorService {
  constructor(private readonly repo: JugadorRepo) {}

  listar(): Promise<Jugador[]> {
    return this.repo.listar();
  }

  async obtener(id: string): Promise<Jugador> {
    const jugador = await this.repo.obtener(id);
    if (!jugador) throw new NoEncontrado('Jugador', id);
    return jugador;
  }

  async crear(datos: NuevoJugador): Promise<Jugador> {
    const errores = validarNuevoJugador(datos);
    if (errores.length) throw new ErrorValidacion(errores);
    return this.repo.crear(datos);
  }

  async actualizar(id: string, cambios: Partial<NuevoJugador>): Promise<Jugador> {
    const actual = await this.obtener(id);
    const propuesto: NuevoJugador = {
      nombre: cambios.nombre ?? actual.nombre,
      apellido1: cambios.apellido1 ?? actual.apellido1,
      apellido2: cambios.apellido2 ?? actual.apellido2,
      cedula: cambios.cedula ?? actual.cedula,
      fechaNacimiento: cambios.fechaNacimiento ?? actual.fechaNacimiento,
      nacionalidad: cambios.nacionalidad ?? actual.nacionalidad,
      tipoSangre: cambios.tipoSangre ?? actual.tipoSangre,
      lateralidad: cambios.lateralidad ?? actual.lateralidad,
      alturaCm: cambios.alturaCm ?? actual.alturaCm,
      pesoKg: cambios.pesoKg ?? actual.pesoKg,
    };
    const errores = validarNuevoJugador(propuesto);
    if (errores.length) throw new ErrorValidacion(errores);

    const actualizado = await this.repo.actualizar(id, cambios);
    if (!actualizado) throw new NoEncontrado('Jugador', id);
    return actualizado;
  }
}
