import { eq } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { equipo } from '../schema/equipo.js';
import type { Equipo, NuevoEquipo } from '../../Logic/dominio/equipo.js';
import type { EquipoRepo } from '../../Logic/administracion/equipo.service.js';

// Traduce la fila de la base al tipo de dominio. Aísla al resto del
// sistema de la forma exacta de la tabla.
function aDominio(fila: typeof equipo.$inferSelect): Equipo {
  return {
    id: fila.id,
    nombre: fila.nombre,
    corto: fila.corto,
    categoria: fila.categoria,
    provincia: fila.provincia,
    sede: fila.sede,
    color: fila.color,
    fundado: fila.fundado,
    creadoEn: fila.creadoEn,
  };
}

// Implementación del puerto EquipoRepo sobre Drizzle. Es la única pieza
// que conoce SQL. El db se inyecta (por defecto el compartido) para
// poder pasar otro en pruebas de integración.
export class DrizzleEquipoRepo implements EquipoRepo {
  constructor(private readonly db = dbCompartida) {}

  async listar(): Promise<Equipo[]> {
    const filas = await this.db.select().from(equipo).orderBy(equipo.nombre);
    return filas.map(aDominio);
  }

  async obtener(id: string): Promise<Equipo | null> {
    const [fila] = await this.db.select().from(equipo).where(eq(equipo.id, id));
    return fila ? aDominio(fila) : null;
  }

  async crear(datos: NuevoEquipo): Promise<Equipo> {
    const [fila] = await this.db.insert(equipo).values(datos).returning();
    return aDominio(fila!);
  }

  async actualizar(id: string, cambios: Partial<NuevoEquipo>): Promise<Equipo | null> {
    const [fila] = await this.db
      .update(equipo)
      .set(cambios)
      .where(eq(equipo.id, id))
      .returning();
    return fila ? aDominio(fila) : null;
  }
}
