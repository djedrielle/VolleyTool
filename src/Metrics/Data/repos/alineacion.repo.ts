import { eq, and, asc } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { alineacion } from '../schema/alineacion.js';
import type {
  Alineacion,
  NuevaAlineacion,
  JugadorAlineado,
} from '../../Logic/dominio/alineacion.js';
import type { AlineacionRepo } from '../../Logic/captura/captura.service.js';

function aDominio(fila: typeof alineacion.$inferSelect): Alineacion {
  return {
    id: fila.id,
    setId: fila.setId,
    equipoId: fila.equipoId,
    jugadorId: fila.jugadorId,
    posicionInicial: fila.posicionInicial,
    esArmador: fila.esArmador,
    esLibero: fila.esLibero,
    entraEnRally: fila.entraEnRally,
    saleEnRally: fila.saleEnRally,
  };
}

export class DrizzleAlineacionRepo implements AlineacionRepo {
  constructor(private readonly db = dbCompartida) {}

  // Borra e inserta la alineación del equipo en ese set, en una
  // transacción: declararla dos veces la corrige, no la duplica.
  async declarar(
    setId: string,
    equipoId: string,
    jugadores: JugadorAlineado[],
  ): Promise<Alineacion[]> {
    return this.db.transaction(async (tx) => {
      await tx
        .delete(alineacion)
        .where(and(eq(alineacion.setId, setId), eq(alineacion.equipoId, equipoId)));
      if (jugadores.length === 0) return [];

      const filas = await tx
        .insert(alineacion)
        .values(
          jugadores.map((j) => ({
            setId,
            equipoId,
            jugadorId: j.jugadorId,
            posicionInicial: j.posicionInicial ?? null,
            esArmador: j.esArmador ?? false,
            esLibero: j.esLibero ?? false,
          })),
        )
        .returning();
      return filas.map(aDominio);
    });
  }

  async listarPorSet(setId: string): Promise<Alineacion[]> {
    const filas = await this.db
      .select()
      .from(alineacion)
      .where(eq(alineacion.setId, setId))
      .orderBy(asc(alineacion.equipoId), asc(alineacion.posicionInicial));
    return filas.map(aDominio);
  }

  // Marcar la salida e insertar la entrada van juntas o no van. Al que
  // sale se le quita el rol de armador: si lo era, el que entra ya lo
  // hereda, y así nunca hay dos armadores activos.
  async sustituir(saleId: string, rally: number, entra: NuevaAlineacion): Promise<Alineacion> {
    return this.db.transaction(async (tx) => {
      await tx
        .update(alineacion)
        .set({ saleEnRally: rally, esArmador: false })
        .where(eq(alineacion.id, saleId));
      const [fila] = await tx.insert(alineacion).values(entra).returning();
      return aDominio(fila!);
    });
  }
}
