import { eq, inArray } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { partido } from '../schema/partido.js';
import { partidoEquipo } from '../schema/partido-equipo.js';
import type { Partido, NuevoPartido, CambiosPartido } from '../../Logic/dominio/partido.js';
import type { PartidoRepo } from '../../Logic/administracion/partido.service.js';

// Une la fila del partido con sus dos filas de partido_equipo para
// producir el modelo de dominio con local y visita.
function armar(
  p: typeof partido.$inferSelect,
  equipos: (typeof partidoEquipo.$inferSelect)[],
): Partido {
  const casa = equipos.find((e) => e.condicion === 'casa');
  const visita = equipos.find((e) => e.condicion === 'visita');
  return {
    id: p.id,
    torneoId: p.torneoId,
    jornada: p.jornada,
    fechaHora: p.fechaHora,
    sede: p.sede,
    estado: p.estado,
    creadoEn: p.creadoEn,
    equipoLocalId: casa?.equipoId ?? '',
    equipoVisitaId: visita?.equipoId ?? '',
  };
}

export class DrizzlePartidoRepo implements PartidoRepo {
  constructor(private readonly db = dbCompartida) {}

  async listar(): Promise<Partido[]> {
    const partidos = await this.db.select().from(partido).orderBy(partido.fechaHora);
    const equipos = await this.db.select().from(partidoEquipo);
    return partidos.map((p) => armar(p, equipos.filter((e) => e.partidoId === p.id)));
  }

  async listarPorTorneo(torneoId: string): Promise<Partido[]> {
    const partidos = await this.db
      .select()
      .from(partido)
      .where(eq(partido.torneoId, torneoId))
      .orderBy(partido.fechaHora);
    if (partidos.length === 0) return [];
    const equipos = await this.db
      .select()
      .from(partidoEquipo)
      .where(
        inArray(
          partidoEquipo.partidoId,
          partidos.map((p) => p.id),
        ),
      );
    return partidos.map((p) => armar(p, equipos.filter((e) => e.partidoId === p.id)));
  }

  async obtener(id: string): Promise<Partido | null> {
    const [p] = await this.db.select().from(partido).where(eq(partido.id, id));
    if (!p) return null;
    const equipos = await this.db
      .select()
      .from(partidoEquipo)
      .where(eq(partidoEquipo.partidoId, id));
    return armar(p, equipos);
  }

  // Partido + sus dos equipos en una sola transacción. El trigger
  // diferido valida "exactamente 2 equipos" al confirmar.
  async crear(datos: NuevoPartido): Promise<Partido> {
    return this.db.transaction(async (tx) => {
      const [p] = await tx
        .insert(partido)
        .values({
          torneoId: datos.torneoId,
          jornada: datos.jornada,
          fechaHora: datos.fechaHora,
          sede: datos.sede,
          estado: datos.estado,
        })
        .returning();
      await tx.insert(partidoEquipo).values([
        { partidoId: p!.id, equipoId: datos.equipoLocalId, condicion: 'casa' },
        { partidoId: p!.id, equipoId: datos.equipoVisitaId, condicion: 'visita' },
      ]);
      return {
        id: p!.id,
        torneoId: p!.torneoId,
        jornada: p!.jornada,
        fechaHora: p!.fechaHora,
        sede: p!.sede,
        estado: p!.estado,
        creadoEn: p!.creadoEn,
        equipoLocalId: datos.equipoLocalId,
        equipoVisitaId: datos.equipoVisitaId,
      };
    });
  }

  async actualizar(id: string, cambios: CambiosPartido): Promise<Partido | null> {
    const [p] = await this.db
      .update(partido)
      .set(cambios)
      .where(eq(partido.id, id))
      .returning();
    if (!p) return null;
    const equipos = await this.db
      .select()
      .from(partidoEquipo)
      .where(eq(partidoEquipo.partidoId, id));
    return armar(p, equipos);
  }
}
