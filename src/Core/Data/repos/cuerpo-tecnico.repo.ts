import { eq } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { cuerpoTecnico } from '../schema/cuerpo-tecnico.js';
import type { CuerpoTecnico, NuevoCuerpoTecnico } from '../../Logic/dominio/cuerpo-tecnico.js';
import type { CuerpoTecnicoRepo } from '../../Logic/administracion/cuerpo-tecnico.service.js';

function aDominio(fila: typeof cuerpoTecnico.$inferSelect): CuerpoTecnico {
  return {
    id: fila.id,
    nombre: fila.nombre,
    apellido1: fila.apellido1,
    apellido2: fila.apellido2,
    nacionalidad: fila.nacionalidad,
    creadoEn: fila.creadoEn,
  };
}

export class DrizzleCuerpoTecnicoRepo implements CuerpoTecnicoRepo {
  constructor(private readonly db = dbCompartida) {}

  async listar(): Promise<CuerpoTecnico[]> {
    const filas = await this.db.select().from(cuerpoTecnico).orderBy(cuerpoTecnico.apellido1);
    return filas.map(aDominio);
  }

  async obtener(id: string): Promise<CuerpoTecnico | null> {
    const [fila] = await this.db.select().from(cuerpoTecnico).where(eq(cuerpoTecnico.id, id));
    return fila ? aDominio(fila) : null;
  }

  async crear(datos: NuevoCuerpoTecnico): Promise<CuerpoTecnico> {
    const [fila] = await this.db.insert(cuerpoTecnico).values(datos).returning();
    return aDominio(fila!);
  }

  async actualizar(
    id: string,
    cambios: Partial<NuevoCuerpoTecnico>,
  ): Promise<CuerpoTecnico | null> {
    const [fila] = await this.db
      .update(cuerpoTecnico)
      .set(cambios)
      .where(eq(cuerpoTecnico.id, id))
      .returning();
    return fila ? aDominio(fila) : null;
  }
}
