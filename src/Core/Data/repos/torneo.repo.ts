import { eq } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { torneo } from '../schema/torneo.js';
import type { Torneo, NuevoTorneo } from '../../Logic/dominio/torneo.js';
import type { TorneoRepo } from '../../Logic/administracion/torneo.service.js';

function aDominio(fila: typeof torneo.$inferSelect): Torneo {
  return {
    id: fila.id,
    nombre: fila.nombre,
    temporada: fila.temporada,
    categoria: fila.categoria,
    fechaInicio: fila.fechaInicio,
    fechaFin: fila.fechaFin,
    formato: fila.formato,
    creadoEn: fila.creadoEn,
  };
}

export class DrizzleTorneoRepo implements TorneoRepo {
  constructor(private readonly db = dbCompartida) {}

  async listar(): Promise<Torneo[]> {
    const filas = await this.db.select().from(torneo).orderBy(torneo.temporada);
    return filas.map(aDominio);
  }

  async obtener(id: string): Promise<Torneo | null> {
    const [fila] = await this.db.select().from(torneo).where(eq(torneo.id, id));
    return fila ? aDominio(fila) : null;
  }

  async crear(datos: NuevoTorneo): Promise<Torneo> {
    const [fila] = await this.db.insert(torneo).values(datos).returning();
    return aDominio(fila!);
  }

  async actualizar(id: string, cambios: Partial<NuevoTorneo>): Promise<Torneo | null> {
    const [fila] = await this.db
      .update(torneo)
      .set(cambios)
      .where(eq(torneo.id, id))
      .returning();
    return fila ? aDominio(fila) : null;
  }
}
