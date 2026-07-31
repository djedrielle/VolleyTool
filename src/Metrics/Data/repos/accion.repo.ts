import { eq, asc } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { accion } from '../schema/accion.js';
import type { Accion, NuevaAccion } from '../../Logic/dominio/accion.js';
import type { AccionRepo } from '../../Logic/captura/captura.service.js';

function aDominio(fila: typeof accion.$inferSelect): Accion {
  return {
    id: fila.id,
    setId: fila.setId,
    equipoId: fila.equipoId,
    jugadorId: fila.jugadorId,
    rally: fila.rally,
    ordenEnRally: fila.ordenEnRally,
    rotacion: fila.rotacion,
    tipo: fila.tipo,
    resultado: fila.resultado,
    puntoParaEquipoId: fila.puntoParaEquipoId,
    corrigeAccionId: fila.corrigeAccionId,
    registradoEn: fila.registradoEn,
    registradoPor: fila.registradoPor,
  };
}

// Repo append-only: solo anexar y leer. A propósito NO expone update ni
// delete — refleja en el código la misma regla que el trigger hace cumplir
// en la base. Para corregir se anexa otra acción (rebanada del proyector).
export class DrizzleAccionRepo implements AccionRepo {
  constructor(private readonly db = dbCompartida) {}

  async anexar(datos: NuevaAccion): Promise<Accion> {
    const [fila] = await this.db.insert(accion).values(datos).returning();
    return aDominio(fila!);
  }

  async listarPorSet(setId: string): Promise<Accion[]> {
    const filas = await this.db
      .select()
      .from(accion)
      .where(eq(accion.setId, setId))
      .orderBy(asc(accion.rally), asc(accion.ordenEnRally));
    return filas.map(aDominio);
  }
}
