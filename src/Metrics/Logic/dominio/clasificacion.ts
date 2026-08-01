// La tabla de posiciones de un torneo. Código puro: recibe resultados
// ya reducidos y devuelve las filas ordenadas, sin saber de dónde
// salieron los sets ni quién es local.

import type { SetPartido } from './set-partido.js';

// Al mejor de 5: gana el partido quien llegue a 3 sets.
export const SETS_PARA_GANAR = 3;

export interface FilaClasificacion {
  torneoId: string;
  equipoId: string;
  pj: number;
  pg: number;
  pp: number;
  setsFavor: number;
  setsContra: number;
  puntos: number;
}

// Un partido reducido a lo único que la tabla necesita: quiénes jugaron
// y cuántos sets ganó cada lado.
export interface ResultadoPartido {
  equipoCasaId: string;
  equipoVisitaId: string;
  setsCasa: number;
  setsVisita: number;
}

// Sets ganados por lado. Solo cuentan los sets cerrados: uno en curso
// todavía puede cambiar de dueño.
export function setsGanados(sets: SetPartido[]): { casa: number; visita: number } {
  let casa = 0;
  let visita = 0;
  for (const s of sets) {
    if (!s.cerrado) continue;
    if (s.puntosCasa > s.puntosVisita) casa++;
    else if (s.puntosVisita > s.puntosCasa) visita++;
  }
  return { casa, visita };
}

// Un partido entra a la tabla cuando está decidido, no cuando alguien
// se acuerda de marcarlo finalizado: se deduce de los sets.
export function partidoDecidido(r: ResultadoPartido): boolean {
  return r.setsCasa >= SETS_PARA_GANAR || r.setsVisita >= SETS_PARA_GANAR;
}

// Sistema FIVB: el 3-0 y el 3-1 dan 3 puntos al ganador y 0 al perdedor;
// el 3-2 los reparte 2-1, porque llegar al tie-break vale algo.
export function puntosDelPartido(r: ResultadoPartido): { casa: number; visita: number } {
  const setsDelPerdedor = Math.min(r.setsCasa, r.setsVisita);
  const alTieBreak = setsDelPerdedor === SETS_PARA_GANAR - 1;
  const ganador = alTieBreak ? 2 : 3;
  const perdedor = alTieBreak ? 1 : 0;
  return r.setsCasa > r.setsVisita
    ? { casa: ganador, visita: perdedor }
    : { casa: perdedor, visita: ganador };
}

// Coeficiente de sets: el primer desempate cuando dos equipos suman lo
// mismo. Sin sets en contra el cociente se dispara, así que se usa el
// total a favor.
function coeficiente(f: FilaClasificacion): number {
  return f.setsContra === 0 ? f.setsFavor : f.setsFavor / f.setsContra;
}

function comparar(a: FilaClasificacion, b: FilaClasificacion): number {
  if (b.puntos !== a.puntos) return b.puntos - a.puntos;
  const dif = coeficiente(b) - coeficiente(a);
  if (dif !== 0) return dif;
  return b.setsFavor - a.setsFavor;
}

// Arma la tabla desde cero con todos los partidos del torneo. Los
// equipos aparecen aunque no hayan jugado todavía (fila en ceros): la
// tabla se publica desde el día uno.
export function calcularClasificacion(
  torneoId: string,
  resultados: ResultadoPartido[],
): FilaClasificacion[] {
  const tabla = new Map<string, FilaClasificacion>();
  const fila = (equipoId: string): FilaClasificacion => {
    let f = tabla.get(equipoId);
    if (!f) {
      f = { torneoId, equipoId, pj: 0, pg: 0, pp: 0, setsFavor: 0, setsContra: 0, puntos: 0 };
      tabla.set(equipoId, f);
    }
    return f;
  };

  for (const r of resultados) {
    const casa = fila(r.equipoCasaId);
    const visita = fila(r.equipoVisitaId);
    if (!partidoDecidido(r)) continue;

    casa.pj++;
    visita.pj++;
    casa.setsFavor += r.setsCasa;
    casa.setsContra += r.setsVisita;
    visita.setsFavor += r.setsVisita;
    visita.setsContra += r.setsCasa;

    if (r.setsCasa > r.setsVisita) {
      casa.pg++;
      visita.pp++;
    } else {
      visita.pg++;
      casa.pp++;
    }

    const puntos = puntosDelPartido(r);
    casa.puntos += puntos.casa;
    visita.puntos += puntos.visita;
  }

  return [...tabla.values()].sort(comparar);
}
