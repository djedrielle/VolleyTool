// La alineación de un equipo en un set y, sobre ella, la rotación.
// Código puro: sabe girar la cancha, no sabe de dónde salen los datos.

import type { Accion } from './accion.js';

export const JUGADORES_EN_CANCHA = 6;

// Una fila por jugador y set. OJO con el nombre: `rotacionInicial` es la
// POSICIÓN 1..6 en la que el jugador arranca el set (su zona de la
// cancha), no el número de rotación del equipo. El líbero no ocupa
// ninguna posición del giro, por eso va en null. `entraEnRally` y
// `saleEnRally` marcan los cambios.
export interface Alineacion {
  id: string;
  setId: string;
  equipoId: string;
  jugadorId: string;
  rotacionInicial: number | null;
  esLibero: boolean;
  entraEnRally: number | null;
  saleEnRally: number | null;
}

export type NuevaAlineacion = Omit<Alineacion, 'id'>;

// Lo que declara el capturador al armar el set.
export interface JugadorAlineado {
  jugadorId: string;
  rotacionInicial?: number | null;
  esLibero?: boolean;
}

export function validarAlineacion(jugadores: JugadorAlineado[]): string[] {
  const errores: string[] = [];
  const titulares = jugadores.filter((j) => !j.esLibero);

  if (titulares.length !== JUGADORES_EN_CANCHA)
    errores.push(`Se necesitan ${JUGADORES_EN_CANCHA} titulares en la cancha.`);

  const posiciones = new Set<number>();
  let posicionesValidas = true;
  for (const t of titulares) {
    const p = t.rotacionInicial;
    if (p == null || !Number.isInteger(p) || p < 1 || p > JUGADORES_EN_CANCHA)
      posicionesValidas = false;
    else posiciones.add(p);
  }
  if (!posicionesValidas)
    errores.push('Cada titular necesita su posición inicial, entre 1 y 6.');
  else if (posiciones.size !== titulares.length)
    errores.push('Dos titulares no pueden arrancar en la misma posición.');

  if (jugadores.some((j) => j.esLibero && j.rotacionInicial != null))
    errores.push('El líbero no ocupa una posición del giro.');
  if (jugadores.some((j) => !j.jugadorId)) errores.push('Falta el id de algún jugador.');
  if (new Set(jugadores.map((j) => j.jugadorId)).size !== jugadores.length)
    errores.push('Un jugador no puede aparecer dos veces en la alineación.');

  return errores;
}

// Quién abre el saque del set. Normalmente es la primera acción de
// saque; si el capturador todavía no la registró, se asume que abrió el
// equipo de la primera acción que haya.
function equipoQueAbre(acciones: Accion[]): string | null {
  const saque = acciones.find((a) => a.tipo === 'saque');
  return saque?.equipoId ?? acciones[0]?.equipoId ?? null;
}

// Un equipo rota cada vez que gana un punto SIN estar sacando (el
// side-out); si gana con su propio saque se queda igual. La rotación es
// ese contador dando la vuelta: 1, 2, ... 6 y de nuevo 1. Por eso no
// hace falta la alineación para deducirla, basta con la seguidilla de
// puntos: la rotación 1 es, por definición, como arrancó el set.
export function rotacionActual(equipoId: string, acciones: Accion[]): number {
  let sacando = equipoQueAbre(acciones);
  let giros = 0;
  for (const a of acciones) {
    const ganador = a.puntoParaEquipoId;
    if (!ganador) continue;
    if (ganador !== sacando) {
      if (ganador === equipoId) giros++;
      sacando = ganador;
    }
  }
  return (giros % JUGADORES_EN_CANCHA) + 1;
}

// La cancha gira en sentido horario: el de la zona 2 pasa a la 1, el de
// la 1 a la 6, y así. En la rotación 1 cada quien está donde arrancó.
export function zonaEnRotacion(rotacionInicial: number, rotacion: number): number {
  const giro = (((rotacionInicial - rotacion) % JUGADORES_EN_CANCHA) + JUGADORES_EN_CANCHA) %
    JUGADORES_EN_CANCHA;
  return giro + 1;
}

// Las zonas 2, 3 y 4 son las de la red.
export function esDelantero(zona: number): boolean {
  return zona >= 2 && zona <= 4;
}

// Quién está en cancha en un rally dado, según los cambios.
export function enCancha(alineacion: Alineacion[], rally: number): Alineacion[] {
  return alineacion.filter(
    (a) => (a.entraEnRally ?? 1) <= rally && (a.saleEnRally == null || a.saleEnRally > rally),
  );
}

export interface PosicionEnCancha {
  jugadorId: string;
  zona: number | null; // null = líbero, no entra en el giro
  delantero: boolean;
}

// La foto de la cancha: dónde está parado cada jugador de un equipo en
// una rotación y un rally dados.
export function posicionesEnCancha(
  alineacion: Alineacion[],
  rotacion: number,
  rally: number,
): PosicionEnCancha[] {
  return enCancha(alineacion, rally).map((a) => {
    const zona = a.rotacionInicial == null ? null : zonaEnRotacion(a.rotacionInicial, rotacion);
    return { jugadorId: a.jugadorId, zona, delantero: zona != null && esDelantero(zona) };
  });
}
