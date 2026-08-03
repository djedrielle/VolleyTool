// La alineación de un equipo en un set y, sobre ella, la rotación.
// Código puro: sabe girar la cancha, no sabe de dónde salen los datos.

import type { Accion } from './accion.js';

export const JUGADORES_EN_CANCHA = 6;

// Una fila por jugador y set. `posicionInicial` es la ZONA 1..6 en la que
// arranca el jugador (su lugar en la cancha al abrir el set), null en el
// líbero, que no entra en el giro. `esArmador` marca al jugador que ancla
// el número de rotación del equipo. `entraEnRally` y `saleEnRally` marcan
// los cambios.
export interface Alineacion {
  id: string;
  setId: string;
  equipoId: string;
  jugadorId: string;
  posicionInicial: number | null;
  esArmador: boolean;
  esLibero: boolean;
  entraEnRally: number | null;
  saleEnRally: number | null;
}

export type NuevaAlineacion = Omit<Alineacion, 'id'>;

// Lo que declara el capturador al armar el set.
export interface JugadorAlineado {
  jugadorId: string;
  posicionInicial?: number | null;
  esArmador?: boolean;
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
    const p = t.posicionInicial;
    if (p == null || !Number.isInteger(p) || p < 1 || p > JUGADORES_EN_CANCHA)
      posicionesValidas = false;
    else posiciones.add(p);
  }
  if (!posicionesValidas)
    errores.push('Cada titular necesita su posición inicial, entre 1 y 6.');
  else if (posiciones.size !== titulares.length)
    errores.push('Dos titulares no pueden arrancar en la misma posición.');

  if (jugadores.some((j) => j.esLibero && j.posicionInicial != null))
    errores.push('El líbero no ocupa una posición del giro.');

  // El armador es opcional, pero si viene tiene que ser uno solo y no el
  // líbero: es lo que ancla el número de rotación.
  const armadores = jugadores.filter((j) => j.esArmador);
  if (armadores.length > 1)
    errores.push('Solo puede haber un armador en la alineación.');
  if (armadores.some((j) => j.esLibero)) errores.push('El armador no puede ser el líbero.');

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

// Cuántas veces rotó el equipo desde el arranque del set. Un equipo rota
// cada vez que gana un punto SIN estar sacando (el side-out); si gana con
// su propio saque se queda igual. No hace falta la alineación para
// contarlo, basta con la seguidilla de puntos.
function girosDeEquipo(equipoId: string, acciones: Accion[]): number {
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
  return giros;
}

// La rotación RELATIVA: 1..6, donde 1 es como arrancó el set. Sirve para
// las POSICIONES en cancha, que dependen solo de cuánto rotó el equipo,
// no de cómo numeremos las rotaciones.
export function rotacionRelativa(equipoId: string, acciones: Accion[]): number {
  return (girosDeEquipo(equipoId, acciones) % JUGADORES_EN_CANCHA) + 1;
}

// La rotación del equipo, la que etiqueta las acciones y las métricas.
// Anclada al armador: es la zona en la que está parado AHORA, así
// "rotación 3" quiere decir "armador en zona 3" en todos los sets y las
// métricas por rotación se pueden comparar y sumar entre sets. Si no se
// declaró armador, cae en la relativa (arranca en 1).
export function rotacionActual(
  equipoId: string,
  acciones: Accion[],
  zonaInicialArmador: number | null = null,
): number {
  const relativa = rotacionRelativa(equipoId, acciones);
  return zonaInicialArmador == null ? relativa : zonaEnRotacion(zonaInicialArmador, relativa);
}

// La zona 1..6 en la que arranca el armador de un equipo (o null si no se
// marcó). Se lee del que sigue activo, que hereda la posición si hubo
// cambio.
export function zonaInicialArmador(alineacion: Alineacion[], equipoId: string): number | null {
  const arm = alineacion.find(
    (a) => a.equipoId === equipoId && a.esArmador && a.saleEnRally == null,
  );
  return arm?.posicionInicial ?? null;
}

// La cancha gira en sentido horario: el de la zona 2 pasa a la 1, el de
// la 1 a la 6, y así. En la rotación relativa 1 cada quien está donde
// arrancó.
export function zonaEnRotacion(posicionInicial: number, rotacionRelativa: number): number {
  const giro =
    (((posicionInicial - rotacionRelativa) % JUGADORES_EN_CANCHA) + JUGADORES_EN_CANCHA) %
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

// La foto de la cancha: dónde está parado cada jugador de un equipo. Va
// con la rotación RELATIVA porque el lugar físico depende de cuánto rotó
// el equipo, no de cómo numeremos la rotación.
export function posicionesEnCancha(
  alineacion: Alineacion[],
  rotacionRelativa: number,
  rally: number,
): PosicionEnCancha[] {
  return enCancha(alineacion, rally).map((a) => {
    const zona = a.posicionInicial == null ? null : zonaEnRotacion(a.posicionInicial, rotacionRelativa);
    return { jugadorId: a.jugadorId, zona, delantero: zona != null && esDelantero(zona) };
  });
}
