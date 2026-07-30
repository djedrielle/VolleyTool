import { eq } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { jugador } from '../schema/jugador.js';
import type { Jugador, NuevoJugador } from '../../Logic/dominio/jugador.js';
import type { JugadorRepo } from '../../Logic/administracion/jugador.service.js';

function aDominio(fila: typeof jugador.$inferSelect): Jugador {
  return {
    id: fila.id,
    nombre: fila.nombre,
    apellido1: fila.apellido1,
    apellido2: fila.apellido2,
    cedula: fila.cedula,
    fechaNacimiento: fila.fechaNacimiento,
    nacionalidad: fila.nacionalidad,
    tipoSangre: fila.tipoSangre,
    lateralidad: fila.lateralidad,
    alturaCm: fila.alturaCm,
    pesoKg: fila.pesoKg,
    creadoEn: fila.creadoEn,
  };
}

export class DrizzleJugadorRepo implements JugadorRepo {
  constructor(private readonly db = dbCompartida) {}

  async listar(): Promise<Jugador[]> {
    const filas = await this.db.select().from(jugador).orderBy(jugador.apellido1);
    return filas.map(aDominio);
  }

  async obtener(id: string): Promise<Jugador | null> {
    const [fila] = await this.db.select().from(jugador).where(eq(jugador.id, id));
    return fila ? aDominio(fila) : null;
  }

  async crear(datos: NuevoJugador): Promise<Jugador> {
    const [fila] = await this.db.insert(jugador).values(datos).returning();
    return aDominio(fila!);
  }

  async actualizar(id: string, cambios: Partial<NuevoJugador>): Promise<Jugador | null> {
    const [fila] = await this.db
      .update(jugador)
      .set(cambios)
      .where(eq(jugador.id, id))
      .returning();
    return fila ? aDominio(fila) : null;
  }
}
