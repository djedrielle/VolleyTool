import { accionesVigentes, type Accion } from '../dominio/accion.js';
import type { SetPartido } from '../dominio/set-partido.js';
import {
  contar,
  contarPorRotacion,
  type MetricasJugadorPartido,
  type MetricasEquipoPartido,
  type MetricasRotacion,
} from '../dominio/metricas.js';
import {
  calcularClasificacion,
  setsGanados,
  type FilaClasificacion,
  type ResultadoPartido,
} from '../dominio/clasificacion.js';
import type { CoreClient } from '../core-client.js';
import { NoEncontrado } from '../../../shared/errors.js';

// Puertos: el proyector solo LEE acciones y sets, y ESCRIBE agregados.
export interface AccionLectura {
  listarPorSet(setId: string): Promise<Accion[]>;
}
export interface SetLectura {
  listarPorPartido(partidoId: string): Promise<SetPartido[]>;
}
export interface AgregadosEscritura {
  reemplazarDePartido(
    partidoId: string,
    datos: {
      jugadores: MetricasJugadorPartido[];
      equipos: MetricasEquipoPartido[];
      rotaciones: MetricasRotacion[];
    },
  ): Promise<void>;
}

export interface ClasificacionEscritura {
  reemplazarDeTorneo(torneoId: string, filas: FilaClasificacion[]): Promise<void>;
}

export interface ResumenProyeccion {
  jugadores: number;
  equipos: number;
  rotaciones: number;
  clasificacion: number;
}

// El proyector: convierte la verdad cruda (acciones) en agregados. Es
// idempotente — correrlo dos veces sobre el mismo partido da el mismo
// resultado, porque reemplaza en vez de sumar.
export class ProyeccionService {
  constructor(
    private readonly acciones: AccionLectura,
    private readonly sets: SetLectura,
    private readonly agregados: AgregadosEscritura,
    private readonly clasificacion: ClasificacionEscritura,
    private readonly core: CoreClient,
  ) {}

  async proyectarPartido(partidoId: string): Promise<ResumenProyeccion> {
    const sets = await this.sets.listarPorPartido(partidoId);
    if (sets.length === 0) throw new NoEncontrado('Partido con sets', partidoId);

    const todas: Accion[] = [];
    for (const s of sets) {
      todas.push(...(await this.acciones.listarPorSet(s.id)));
    }
    const vigentes = accionesVigentes(todas);

    const jugadores = this.porJugador(vigentes, partidoId);
    const equipos = this.porEquipo(vigentes, partidoId);
    const rotaciones = this.porRotacion(vigentes, partidoId);

    await this.agregados.reemplazarDePartido(partidoId, { jugadores, equipos, rotaciones });

    // La tabla del torneo depende de este partido, así que se recalcula
    // en cascada. Core es quien sabe a qué torneo pertenece.
    const info = await this.core.obtenerPartido(partidoId);
    const tabla = info ? await this.proyectarTorneo(info.torneoId) : [];

    return {
      jugadores: jugadores.length,
      equipos: equipos.length,
      rotaciones: rotaciones.length,
      clasificacion: tabla.length,
    };
  }

  // La tabla de posiciones: Core dice qué partidos tiene el torneo y
  // quién juega de casa; Metrics pone los sets. Se rehace completa cada
  // vez, igual que el resto del proyector.
  async proyectarTorneo(torneoId: string): Promise<FilaClasificacion[]> {
    const partidos = await this.core.partidosDeTorneo(torneoId);

    const resultados: ResultadoPartido[] = [];
    for (const p of partidos) {
      const ganados = setsGanados(await this.sets.listarPorPartido(p.id));
      resultados.push({
        equipoCasaId: p.equipoCasaId,
        equipoVisitaId: p.equipoVisitaId,
        setsCasa: ganados.casa,
        setsVisita: ganados.visita,
      });
    }

    const tabla = calcularClasificacion(torneoId, resultados);
    await this.clasificacion.reemplazarDeTorneo(torneoId, tabla);
    return tabla;
  }

  private porJugador(acciones: Accion[], partidoId: string): MetricasJugadorPartido[] {
    const grupos = new Map<string, Accion[]>();
    for (const a of acciones) {
      const arr = grupos.get(a.jugadorId) ?? [];
      arr.push(a);
      grupos.set(a.jugadorId, arr);
    }
    const filas: MetricasJugadorPartido[] = [];
    for (const [jugadorId, accs] of grupos) {
      filas.push({
        jugadorId,
        partidoId,
        equipoId: accs[0]!.equipoId,
        setsJugados: new Set(accs.map((a) => a.setId)).size,
        ...contar(accs),
      });
    }
    return filas;
  }

  private porEquipo(acciones: Accion[], partidoId: string): MetricasEquipoPartido[] {
    const equipos = [...new Set(acciones.map((a) => a.equipoId))];
    return equipos.map((equipoId) => ({
      equipoId,
      partidoId,
      ...contar(acciones.filter((a) => a.equipoId === equipoId)),
    }));
  }

  private porRotacion(acciones: Accion[], partidoId: string): MetricasRotacion[] {
    const equipos = [...new Set(acciones.map((a) => a.equipoId))];
    return equipos.flatMap((equipoId) => contarPorRotacion(acciones, equipoId, partidoId));
  }
}
