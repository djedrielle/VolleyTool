import { eq, desc } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { clasificacion } from '../schema/clasificacion.js';
import type { FilaClasificacion } from '../../Logic/dominio/clasificacion.js';
import type { ClasificacionEscritura } from '../../Logic/proyeccion/proyeccion.service.js';
import type { ClasificacionLectura } from '../../Logic/consultas/consultas.service.js';

// Como el repo de agregados: una implementación para los dos puertos,
// el de escritura (proyección) y el de lectura (consultas).
export class DrizzleClasificacionRepo implements ClasificacionEscritura, ClasificacionLectura {
  constructor(private readonly db = dbCompartida) {}

  // Borra e inserta la tabla completa del torneo en una transacción:
  // así el recálculo es idempotente y nunca queda a medias.
  async reemplazarDeTorneo(torneoId: string, filas: FilaClasificacion[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(clasificacion).where(eq(clasificacion.torneoId, torneoId));
      if (filas.length) await tx.insert(clasificacion).values(filas);
    });
  }

  async tablaDeTorneo(torneoId: string): Promise<FilaClasificacion[]> {
    const filas = await this.db
      .select()
      .from(clasificacion)
      .where(eq(clasificacion.torneoId, torneoId))
      .orderBy(desc(clasificacion.puntos), desc(clasificacion.setsFavor));
    return filas.map(({ calculadoEn: _omit, ...f }) => f);
  }
}
