import { eq } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { plantillaTecnico } from '../schema/plantilla-tecnico.js';
import type {
  PlantillaTecnico,
  NuevaPlantillaTecnico,
} from '../../Logic/dominio/plantilla-tecnico.js';
import type { PlantillaTecnicoRepo } from '../../Logic/administracion/plantilla-tecnico.service.js';

function aDominio(fila: typeof plantillaTecnico.$inferSelect): PlantillaTecnico {
  return {
    id: fila.id,
    cuerpoTecnicoId: fila.cuerpoTecnicoId,
    equipoId: fila.equipoId,
    torneoId: fila.torneoId,
    rol: fila.rol,
  };
}

export class DrizzlePlantillaTecnicoRepo implements PlantillaTecnicoRepo {
  constructor(private readonly db = dbCompartida) {}

  async listar(): Promise<PlantillaTecnico[]> {
    const filas = await this.db.select().from(plantillaTecnico);
    return filas.map(aDominio);
  }

  async obtener(id: string): Promise<PlantillaTecnico | null> {
    const [fila] = await this.db
      .select()
      .from(plantillaTecnico)
      .where(eq(plantillaTecnico.id, id));
    return fila ? aDominio(fila) : null;
  }

  async crear(datos: NuevaPlantillaTecnico): Promise<PlantillaTecnico> {
    const [fila] = await this.db.insert(plantillaTecnico).values(datos).returning();
    return aDominio(fila!);
  }

  async actualizar(
    id: string,
    cambios: Partial<NuevaPlantillaTecnico>,
  ): Promise<PlantillaTecnico | null> {
    const [fila] = await this.db
      .update(plantillaTecnico)
      .set(cambios)
      .where(eq(plantillaTecnico.id, id))
      .returning();
    return fila ? aDominio(fila) : null;
  }
}
