import { describe, it, expect } from 'vitest';
import {
  calcularClasificacion,
  puntosDelPartido,
  setsGanados,
  partidoDecidido,
  type ResultadoPartido,
} from './clasificacion.js';
import type { SetPartido } from './set-partido.js';

function set(over: Partial<SetPartido>): SetPartido {
  return {
    id: 's',
    partidoId: 'p1',
    numero: 1,
    puntosCasa: 25,
    puntosVisita: 20,
    cerrado: true,
    ...over,
  };
}

function resultado(over: Partial<ResultadoPartido>): ResultadoPartido {
  return { equipoCasaId: 'e1', equipoVisitaId: 'e2', setsCasa: 3, setsVisita: 0, ...over };
}

describe('setsGanados', () => {
  it('cuenta solo los sets cerrados', () => {
    const g = setsGanados([
      set({ numero: 1, puntosCasa: 25, puntosVisita: 20 }),
      set({ numero: 2, puntosCasa: 18, puntosVisita: 25 }),
      set({ numero: 3, puntosCasa: 24, puntosVisita: 12, cerrado: false }), // en curso
    ]);
    expect(g).toEqual({ casa: 1, visita: 1 });
  });
});

describe('partidoDecidido', () => {
  it('exige que alguno llegue a 3 sets', () => {
    expect(partidoDecidido(resultado({ setsCasa: 3, setsVisita: 1 }))).toBe(true);
    expect(partidoDecidido(resultado({ setsCasa: 2, setsVisita: 1 }))).toBe(false);
  });
});

describe('puntosDelPartido', () => {
  it('da 3-0 cuando no se llega al tie-break', () => {
    expect(puntosDelPartido(resultado({ setsCasa: 3, setsVisita: 1 }))).toEqual({
      casa: 3,
      visita: 0,
    });
  });

  it('reparte 2-1 cuando se gana en el quinto', () => {
    expect(puntosDelPartido(resultado({ setsCasa: 2, setsVisita: 3 }))).toEqual({
      casa: 1,
      visita: 2,
    });
  });
});

describe('calcularClasificacion', () => {
  it('acumula y ordena por puntos', () => {
    const tabla = calcularClasificacion('t1', [
      resultado({ equipoCasaId: 'a', equipoVisitaId: 'b', setsCasa: 3, setsVisita: 0 }),
      resultado({ equipoCasaId: 'c', equipoVisitaId: 'a', setsCasa: 3, setsVisita: 2 }),
    ]);

    expect(tabla.map((f) => f.equipoId)).toEqual(['a', 'c', 'b']);

    const a = tabla.find((f) => f.equipoId === 'a')!;
    expect(a).toMatchObject({
      torneoId: 't1',
      pj: 2,
      pg: 1,
      pp: 1,
      setsFavor: 5,
      setsContra: 3,
      puntos: 4, // 3 por el 3-0 + 1 por caer en el tie-break
    });
  });

  it('incluye en ceros a los equipos con partidos sin decidir', () => {
    const tabla = calcularClasificacion('t1', [
      resultado({ equipoCasaId: 'a', equipoVisitaId: 'b', setsCasa: 1, setsVisita: 0 }),
    ]);
    expect(tabla).toHaveLength(2);
    expect(tabla.every((f) => f.pj === 0 && f.puntos === 0 && f.setsFavor === 0)).toBe(true);
  });
});
