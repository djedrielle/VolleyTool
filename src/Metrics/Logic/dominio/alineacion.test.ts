import { describe, it, expect } from 'vitest';
import {
  validarAlineacion,
  rotacionActual,
  zonaEnRotacion,
  enCancha,
  posicionesEnCancha,
  type Alineacion,
} from './alineacion.js';
import type { Accion } from './accion.js';

const TITULARES = [1, 2, 3, 4, 5, 6].map((p) => ({
  jugadorId: `j${p}`,
  rotacionInicial: p,
}));

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

// Un rally: saque del que le toca y el punto para quien lo gana.
function rally(numero: number, saca: string, gana: string): Accion[] {
  return [
    acc({ id: `s${numero}`, rally: numero, equipoId: saca, tipo: 'saque', resultado: 'recibido' }),
    acc({
      id: `p${numero}`,
      rally: numero,
      ordenEnRally: 2,
      equipoId: gana,
      tipo: 'ataque',
      resultado: 'punto_directo',
      puntoParaEquipoId: gana,
    }),
  ];
}

function alin(over: Partial<Alineacion>): Alineacion {
  return {
    id: 'x',
    setId: 's1',
    equipoId: 'e1',
    jugadorId: 'j1',
    rotacionInicial: 1,
    esLibero: false,
    entraEnRally: null,
    saleEnRally: null,
    ...over,
  };
}

describe('validarAlineacion', () => {
  it('acepta 6 titulares en posiciones distintas más el líbero', () => {
    expect(
      validarAlineacion([...TITULARES, { jugadorId: 'j7', esLibero: true }]),
    ).toEqual([]);
  });

  it('rechaza si faltan titulares', () => {
    expect(validarAlineacion(TITULARES.slice(0, 5)).length).toBeGreaterThan(0);
  });

  it('rechaza dos titulares en la misma posición', () => {
    const repetida = [...TITULARES.slice(0, 5), { jugadorId: 'j9', rotacionInicial: 1 }];
    expect(validarAlineacion(repetida).length).toBeGreaterThan(0);
  });

  it('rechaza al líbero con posición de giro', () => {
    const errores = validarAlineacion([
      ...TITULARES,
      { jugadorId: 'j7', esLibero: true, rotacionInicial: 2 },
    ]);
    expect(errores.length).toBeGreaterThan(0);
  });
});

describe('rotacionActual', () => {
  it('arranca en 1 cuando el set no tiene acciones', () => {
    expect(rotacionActual('e1', [])).toBe(1);
  });

  it('no rota al equipo que gana con su propio saque', () => {
    const acciones = [...rally(1, 'e1', 'e1'), ...rally(2, 'e1', 'e1')];
    expect(rotacionActual('e1', acciones)).toBe(1);
    expect(rotacionActual('e2', acciones)).toBe(1);
  });

  it('rota al equipo que gana el punto recibiendo (side-out)', () => {
    const acciones = rally(1, 'e1', 'e2');
    expect(rotacionActual('e2', acciones)).toBe(2);
    expect(rotacionActual('e1', acciones)).toBe(1);
  });

  it('suma un giro por cada side-out', () => {
    // se rompe el saque en todos los rallies: cada equipo rota 3 veces
    const acciones = [
      ...rally(1, 'e1', 'e2'),
      ...rally(2, 'e2', 'e1'),
      ...rally(3, 'e1', 'e2'),
      ...rally(4, 'e2', 'e1'),
      ...rally(5, 'e1', 'e2'),
      ...rally(6, 'e2', 'e1'),
    ];
    expect(rotacionActual('e1', acciones)).toBe(4);
    expect(rotacionActual('e2', acciones)).toBe(4);
  });
});

describe('zonaEnRotacion', () => {
  it('deja a cada quien donde arrancó en la rotación 1', () => {
    expect(zonaEnRotacion(4, 1)).toBe(4);
  });

  it('gira en sentido horario: de la 2 a la 1, de la 1 a la 6', () => {
    expect(zonaEnRotacion(2, 2)).toBe(1);
    expect(zonaEnRotacion(1, 2)).toBe(6);
  });

  it('pasa por las 6 zonas a lo largo de las 6 rotaciones', () => {
    const zonas = [1, 2, 3, 4, 5, 6].map((r) => zonaEnRotacion(3, r));
    expect(new Set(zonas).size).toBe(6);
  });
});

describe('enCancha y posicionesEnCancha', () => {
  it('respeta los rallies de entrada y salida', () => {
    const alineacion = [
      alin({ id: 'a', jugadorId: 'titular', saleEnRally: 10 }),
      alin({ id: 'b', jugadorId: 'suplente', entraEnRally: 10 }),
    ];
    expect(enCancha(alineacion, 9).map((a) => a.jugadorId)).toEqual(['titular']);
    expect(enCancha(alineacion, 10).map((a) => a.jugadorId)).toEqual(['suplente']);
  });

  it('marca delanteros y deja al líbero sin zona', () => {
    const alineacion = [
      alin({ id: 'a', jugadorId: 'j3', rotacionInicial: 3 }),
      alin({ id: 'b', jugadorId: 'j5', rotacionInicial: 5 }),
      alin({ id: 'c', jugadorId: 'libero', rotacionInicial: null, esLibero: true }),
    ];
    const cancha = posicionesEnCancha(alineacion, 1, 1);
    expect(cancha).toContainEqual({ jugadorId: 'j3', zona: 3, delantero: true });
    expect(cancha).toContainEqual({ jugadorId: 'j5', zona: 5, delantero: false });
    expect(cancha).toContainEqual({ jugadorId: 'libero', zona: null, delantero: false });
  });
});
