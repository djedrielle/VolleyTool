import { accionesVigentes, type Accion } from '../dominio/accion.js';
import type { SetPartido } from '../dominio/set-partido.js';
import {
  contar,
  contarPorRotacion,
  type MetricasJugadorPartido,
  type MetricasEquipoPartido,
  type MetricasRotacion,
} from '../dominio/metricas.js';
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

export interface ResumenProyeccion {
  jugadores: number;
  equipos: number;
  rotaciones: number;
}

// El proyector: convierte la verdad cruda (acciones) en agregados. Es
// idempotente — correrlo dos veces sobre el mismo partido da el mismo
// resultado, porque reemplaza en vez de sumar.
export class ProyeccionService {
  constructor(
    private readonly acciones: AccionLectura,
    private readonly sets: SetLectura,
    private readonly agregados: AgregadosEscritura,
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
    return { jugadores: jugadores.length, equipos: equipos.length, rotaciones: rotaciones.length };
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
