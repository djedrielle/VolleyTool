import type {
  MetricasJugadorPartido,
  MetricasEquipoPartido,
  MetricasRotacion,
} from '../dominio/metricas.js';
import type { FilaClasificacion } from '../dominio/clasificacion.js';

// Camino de lectura: SOLO lee agregados ya calculados. Nunca toca la
// tabla de acciones ni recalcula nada.
export interface AgregadosLectura {
  metricasJugador(partidoId: string): Promise<MetricasJugadorPartido[]>;
  metricasEquipo(partidoId: string): Promise<MetricasEquipoPartido[]>;
  metricasRotacion(partidoId: string): Promise<MetricasRotacion[]>;
}

export interface ClasificacionLectura {
  tablaDeTorneo(torneoId: string): Promise<FilaClasificacion[]>;
  deEquipo(equipoId: string): Promise<FilaClasificacion[]>;
}

export class ConsultasService {
  constructor(
    private readonly agregados: AgregadosLectura,
    private readonly tablas: ClasificacionLectura,
  ) {}

  metricasJugador(partidoId: string): Promise<MetricasJugadorPartido[]> {
    return this.agregados.metricasJugador(partidoId);
  }

  metricasEquipo(partidoId: string): Promise<MetricasEquipoPartido[]> {
    return this.agregados.metricasEquipo(partidoId);
  }

  metricasRotacion(partidoId: string): Promise<MetricasRotacion[]> {
    return this.agregados.metricasRotacion(partidoId);
  }

  clasificacion(torneoId: string): Promise<FilaClasificacion[]> {
    return this.tablas.tablaDeTorneo(torneoId);
  }

  // Las filas del equipo en todos los torneos donde tiene resultados. El
  // frontend decide cuál es "el actual" (por temporada) y arma el histórico.
  clasificacionDeEquipo(equipoId: string): Promise<FilaClasificacion[]> {
    return this.tablas.deEquipo(equipoId);
  }
}
