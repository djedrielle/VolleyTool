import { eq } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { plantilla } from '../schema/plantilla.js';
import type { Plantilla, NuevaPlantilla } from '../../Logic/dominio/plantilla.js';
import type { PlantillaRepo } from '../../Logic/administracion/plantilla.service.js';

function aDominio(fila: typeof plantilla.$inferSelect): Plantilla {
  return {
    id: fila.id,
    jugadorId: fila.jugadorId,
    equipoId: fila.equipoId,
    torneoId: fila.torneoId,
    numero: fila.numero,
    posicion: fila.posicion,
    esCapitan: fila.esCapitan,
    desde: fila.desde,
    hasta: fila.hasta,
  };
}

export class DrizzlePlantillaRepo implements PlantillaRepo {
  constructor(private readonly db = dbCompartida) {}

  async listar(): Promise<Plantilla[]> {
    const filas = await this.db.select().from(plantilla).orderBy(plantilla.numero);
    return filas.map(aDominio);
  }

  async obtener(id: string): Promise<Plantilla | null> {
    const [fila] = await this.db.select().from(plantilla).where(eq(plantilla.id, id));
    return fila ? aDominio(fila) : null;
  }

  async crear(datos: NuevaPlantilla): Promise<Plantilla> {
    const [fila] = await this.db.insert(plantilla).values(datos).returning();
    return aDominio(fila!);
  }

  async actualizar(id: string, cambios: Partial<NuevaPlantilla>): Promise<Plantilla | null> {
    const [fila] = await this.db
      .update(plantilla)
      .set(cambios)
      .where(eq(plantilla.id, id))
      .returning();
    return fila ? aDominio(fila) : null;
  }
}
