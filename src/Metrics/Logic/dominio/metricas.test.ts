import { describe, it, expect } from 'vitest';
import { contar, contarPorRotacion } from './metricas.js';
import type { Accion } from './accion.js';

function acc(over: Partial<Accion>): Accion {
  return {
    id: 'a',
    setId: 's1',
    equipoId: 'e1',
    jugadorId: 'j1',
    rally: 1,
    ordenEnRally: 1,
    rotacion: 1,
    tipo: 'ataque',
    resultado: 'punto_directo',
    puntoParaEquipoId: null,
    corrigeAccionId: null,
    registradoEn: new Date(),
    registradoPor: null,
    ...over,
  };
}

describe('contar', () => {
  it('clasifica cada tipo/resultado en su contador', () => {
    const c = contar([
      acc({ tipo: 'ataque', resultado: 'punto_directo' }),
      acc({ tipo: 'ataque', resultado: 'defendido' }),
      acc({ tipo: 'ataque', resultado: 'error' }),
      acc({ tipo: 'saque', resultado: 'ace' }),
      acc({ tipo: 'recepcion', resultado: 'perfecta' }),
      acc({ tipo: 'colocacion', resultado: 'ok' }), // no cuenta
    ]);
    expect(c.ataquesTotales).toBe(3);
    expect(c.ataquesPuntoDirecto).toBe(1);
    expect(c.ataquesDefendidos).toBe(1);
    expect(c.ataquesErrados).toBe(1);
    expect(c.saquesTotales).toBe(1);
    expect(c.aces).toBe(1);
    expect(c.recepcionesTotales).toBe(1);
    expect(c.recepcionesPerfectas).toBe(1);
  });
});

describe('contarPorRotacion', () => {
  it('cuenta ataques y puntos por rotación de un equipo', () => {
    const acciones = [
      acc({ equipoId: 'e1', rotacion: 1, tipo: 'ataque', resultado: 'punto_directo', puntoParaEquipoId: 'e1' }),
      acc({ equipoId: 'e1', rotacion: 1, tipo: 'ataque', resultado: 'defendido' }),
      acc({ equipoId: 'e1', rotacion: 2, tipo: 'ataque', resultado: 'punto_directo', puntoParaEquipoId: 'e1' }),
      acc({ equipoId: 'e2', rotacion: 1, tipo: 'ataque', resultado: 'punto_directo' }), // otro equipo
    ];
    const filas = contarPorRotacion(acciones, 'e1', 'p1');
    expect(filas).toHaveLength(6);
    const r1 = filas.find((f) => f.rotacion === 1)!;
    expect(r1.ataques).toBe(2);
    expect(r1.puntosDirectos).toBe(1);
    expect(r1.puntosTotales).toBe(1);
    const r2 = filas.find((f) => f.rotacion === 2)!;
    expect(r2.ataques).toBe(1);
  });
});
