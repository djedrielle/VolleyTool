import { eq, asc } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { setPartido } from '../schema/set-partido.js';
import type { SetPartido, NuevoSet } from '../../Logic/dominio/set-partido.js';
import type { SetPartidoRepo } from '../../Logic/captura/captura.service.js';

function aDominio(fila: typeof setPartido.$inferSelect): SetPartido {
  return {
    id: fila.id,
    partidoId: fila.partidoId,
    numero: fila.numero,
    puntosCasa: fila.puntosCasa,
    puntosVisita: fila.puntosVisita,
    cerrado: fila.cerrado,
  };
}

export class DrizzleSetPartidoRepo implements SetPartidoRepo {
  constructor(private readonly db = dbCompartida) {}

  async crear(datos: NuevoSet): Promise<SetPartido> {
    const [fila] = await this.db.insert(setPartido).values(datos).returning();
    return aDominio(fila!);
  }

  async obtener(id: string): Promise<SetPartido | null> {
    const [fila] = await this.db.select().from(setPartido).where(eq(setPartido.id, id));
    return fila ? aDominio(fila) : null;
  }

  async listarPorPartido(partidoId: string): Promise<SetPartido[]> {
    const filas = await this.db
      .select()
      .from(setPartido)
      .where(eq(setPartido.partidoId, partidoId))
      .orderBy(asc(setPartido.numero));
    return filas.map(aDominio);
  }

  async cerrar(
    id: string,
    marcador: { puntosCasa: number; puntosVisita: number },
  ): Promise<SetPartido | null> {
    const [fila] = await this.db
      .update(setPartido)
      .set({ cerrado: true, puntosCasa: marcador.puntosCasa, puntosVisita: marcador.puntosVisita })
      .where(eq(setPartido.id, id))
      .returning();
    return fila ? aDominio(fila) : null;
  }
}
