import type { Accion } from './accion.js';

// Las fórmulas de conteo: dado un conjunto de acciones, producir los
// agregados. Código puro, sin base de datos — es el núcleo de Metrics y
// lo más importante de probar. Las claves calcan las columnas del
// esquema (camelCase ↔ snake_case).

// Los 18 contadores de metricas_jugador_partido / metricas_equipo_partido.
export interface Contadores {
  ataquesTotales: number;
  ataquesPuntoDirecto: number;
  ataquesDefendidos: number;
  ataquesErrados: number;
  bloqueosTotales: number;
  bloqueosPuntoDirecto: number;
  bloqueosDefendidos: number;
  bloqueosErrados: number;
  saquesTotales: number;
  aces: number;
  saquesRecibidos: number;
  saquesErrados: number;
  defensasTotales: number;
  defensasExitosas: number;
  recepcionesTotales: number;
  recepcionesPerfectas: number;
  recepcionesFueraSistema: number;
  recepcionesErradas: number;
}

export function contadoresVacios(): Contadores {
  return {
    ataquesTotales: 0,
    ataquesPuntoDirecto: 0,
    ataquesDefendidos: 0,
    ataquesErrados: 0,
    bloqueosTotales: 0,
    bloqueosPuntoDirecto: 0,
    bloqueosDefendidos: 0,
    bloqueosErrados: 0,
    saquesTotales: 0,
    aces: 0,
    saquesRecibidos: 0,
    saquesErrados: 0,
    defensasTotales: 0,
    defensasExitosas: 0,
    recepcionesTotales: 0,
    recepcionesPerfectas: 0,
    recepcionesFueraSistema: 0,
    recepcionesErradas: 0,
  };
}

// Recorre las acciones una sola vez y las clasifica. La colocación no
// entra en estos contadores (no hay columna para ella).
export function contar(acciones: Accion[]): Contadores {
  const c = contadoresVacios();
  for (const a of acciones) {
    switch (a.tipo) {
      case 'ataque':
        c.ataquesTotales++;
        if (a.resultado === 'punto_directo') c.ataquesPuntoDirecto++;
        else if (a.resultado === 'defendido') c.ataquesDefendidos++;
        else if (a.resultado === 'error') c.ataquesErrados++;
        break;
      case 'bloqueo':
        c.bloqueosTotales++;
        if (a.resultado === 'punto_directo') c.bloqueosPuntoDirecto++;
        else if (a.resultado === 'defendido') c.bloqueosDefendidos++;
        else if (a.resultado === 'error') c.bloqueosErrados++;
        break;
      case 'saque':
        c.saquesTotales++;
        if (a.resultado === 'ace') c.aces++;
        else if (a.resultado === 'recibido') c.saquesRecibidos++;
        else if (a.resultado === 'error') c.saquesErrados++;
        break;
      case 'defensa':
        c.defensasTotales++;
        if (a.resultado === 'exitosa') c.defensasExitosas++;
        break;
      case 'recepcion':
        c.recepcionesTotales++;
        if (a.resultado === 'perfecta') c.recepcionesPerfectas++;
        else if (a.resultado === 'fuera_sistema') c.recepcionesFueraSistema++;
        else if (a.resultado === 'error') c.recepcionesErradas++;
        break;
    }
  }
  return c;
}

// Efectividad de ataque por rotación (el diferenciador del producto).
export interface MetricasRotacion {
  equipoId: string;
  partidoId: string;
  rotacion: number;
  ataques: number;
  puntosDirectos: number;
  puntosTotales: number;
}

// Para las 6 rotaciones de un equipo. `puntosTotales` cuenta los puntos
// que el equipo cerró con sus propias acciones en esa rotación (los
// puntos por error rival no se atribuyen a una rotación por ahora).
export function contarPorRotacion(
  acciones: Accion[],
  equipoId: string,
  partidoId: string,
): MetricasRotacion[] {
  const filas: MetricasRotacion[] = [];
  for (let rotacion = 1; rotacion <= 6; rotacion++) {
    const delEquipo = acciones.filter((a) => a.equipoId === equipoId && a.rotacion === rotacion);
    filas.push({
      equipoId,
      partidoId,
      rotacion,
      ataques: delEquipo.filter((a) => a.tipo === 'ataque').length,
      puntosDirectos: delEquipo.filter((a) => a.tipo === 'ataque' && a.resultado === 'punto_directo').length,
      puntosTotales: delEquipo.filter((a) => a.puntoParaEquipoId === equipoId).length,
    });
  }
  return filas;
}

// Filtra las acciones corregidas: si una acción fue reemplazada por otra
// (otra apunta a ella con corrigeAccionId), se descarta. Por ahora no hay
// correcciones, pero el proyector ya nace correcto para cuando lleguen.
export function accionesVigentes(acciones: Accion[]): Accion[] {
  const corregidas = new Set(
    acciones.filter((a) => a.corrigeAccionId).map((a) => a.corrigeAccionId as string),
  );
  return acciones.filter((a) => !corregidas.has(a.id));
}

// Agregados por jugador y por equipo en un partido (los 18 contadores más
// las llaves).
export interface MetricasJugadorPartido extends Contadores {
  jugadorId: string;
  partidoId: string;
  equipoId: string;
  setsJugados: number;
}

export interface MetricasEquipoPartido extends Contadores {
  equipoId: string;
  partidoId: string;
}
