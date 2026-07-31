import { eq } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { metricasJugadorPartido } from '../schema/metricas-jugador-partido.js';
import { metricasEquipoPartido } from '../schema/metricas-equipo-partido.js';
import { metricasRotacion } from '../schema/metricas-rotacion.js';
import type {
  MetricasJugadorPartido,
  MetricasEquipoPartido,
  MetricasRotacion,
} from '../../Logic/dominio/metricas.js';
import type { AgregadosEscritura } from '../../Logic/proyeccion/proyeccion.service.js';
import type { AgregadosLectura } from '../../Logic/consultas/consultas.service.js';

// Una sola implementación cumple los dos puertos: el de escritura (que usa
// el proyector) y el de lectura (que usa consultas). Es la misma tabla,
// vista por dos caminos distintos.
export class DrizzleAgregadosRepo implements AgregadosEscritura, AgregadosLectura {
  constructor(private readonly db = dbCompartida) {}

  // Reemplaza los agregados del partido en una transacción: borra lo
  // anterior e inserta lo nuevo. Así el recálculo es idempotente.
  async reemplazarDePartido(
    partidoId: string,
    datos: {
      jugadores: MetricasJugadorPartido[];
      equipos: MetricasEquipoPartido[];
      rotaciones: MetricasRotacion[];
    },
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(metricasJugadorPartido).where(eq(metricasJugadorPartido.partidoId, partidoId));
      await tx.delete(metricasEquipoPartido).where(eq(metricasEquipoPartido.partidoId, partidoId));
      await tx.delete(metricasRotacion).where(eq(metricasRotacion.partidoId, partidoId));

      if (datos.jugadores.length) await tx.insert(metricasJugadorPartido).values(datos.jugadores);
      if (datos.equipos.length) await tx.insert(metricasEquipoPartido).values(datos.equipos);
      if (datos.rotaciones.length) await tx.insert(metricasRotacion).values(datos.rotaciones);
    });
  }

  async metricasJugador(partidoId: string): Promise<MetricasJugadorPartido[]> {
    const filas = await this.db
      .select()
      .from(metricasJugadorPartido)
      .where(eq(metricasJugadorPartido.partidoId, partidoId));
    return filas.map(({ calculadoEn: _omit, ...m }) => m);
  }

  async metricasEquipo(partidoId: string): Promise<MetricasEquipoPartido[]> {
    const filas = await this.db
      .select()
      .from(metricasEquipoPartido)
      .where(eq(metricasEquipoPartido.partidoId, partidoId));
    return filas.map(({ calculadoEn: _omit, ...m }) => m);
  }

  async metricasRotacion(partidoId: string): Promise<MetricasRotacion[]> {
    const filas = await this.db
      .select()
      .from(metricasRotacion)
      .where(eq(metricasRotacion.partidoId, partidoId));
    return filas.map(({ calculadoEn: _omit, ...m }) => m);
  }
}
