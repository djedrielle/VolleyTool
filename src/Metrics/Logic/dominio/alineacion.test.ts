import { describe, it, expect } from 'vitest';
import {
  validarAlineacion,
  rotacionRelativa,
  rotacionActual,
  zonaInicialArmador,
  zonaEnRotacion,
  enCancha,
  posicionesEnCancha,
  type Alineacion,
} from './alineacion.js';
import type { Accion } from './accion.js';

const TITULARES = [1, 2, 3, 4, 5, 6].map((p) => ({
  jugadorId: `j${p}`,
  posicionInicial: p,
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
    posicionInicial: 1,
    esArmador: false,
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

  it('acepta un armador entre los titulares', () => {
    const conArmador = TITULARES.map((t) =>
      t.jugadorId === 'j2' ? { ...t, esArmador: true } : t,
    );
    expect(validarAlineacion(conArmador)).toEqual([]);
  });

  it('rechaza si faltan titulares', () => {
    expect(validarAlineacion(TITULARES.slice(0, 5)).length).toBeGreaterThan(0);
  });

  it('rechaza dos titulares en la misma posición', () => {
    const repetida = [...TITULARES.slice(0, 5), { jugadorId: 'j9', posicionInicial: 1 }];
    expect(validarAlineacion(repetida).length).toBeGreaterThan(0);
  });

  it('rechaza al líbero con posición de giro', () => {
    const errores = validarAlineacion([
      ...TITULARES,
      { jugadorId: 'j7', esLibero: true, posicionInicial: 2 },
    ]);
    expect(errores.length).toBeGreaterThan(0);
  });

  it('rechaza dos armadores', () => {
    const dos = TITULARES.map((t) =>
      t.jugadorId === 'j2' || t.jugadorId === 'j4' ? { ...t, esArmador: true } : t,
    );
    expect(validarAlineacion(dos).length).toBeGreaterThan(0);
  });
});

describe('rotacionRelativa', () => {
  it('arranca en 1 cuando el set no tiene acciones', () => {
    expect(rotacionRelativa('e1', [])).toBe(1);
  });

  it('no rota al equipo que gana con su propio saque', () => {
    const acciones = [...rally(1, 'e1', 'e1'), ...rally(2, 'e1', 'e1')];
    expect(rotacionRelativa('e1', acciones)).toBe(1);
    expect(rotacionRelativa('e2', acciones)).toBe(1);
  });

  it('rota al equipo que gana el punto recibiendo (side-out)', () => {
    const acciones = rally(1, 'e1', 'e2');
    expect(rotacionRelativa('e2', acciones)).toBe(2);
    expect(rotacionRelativa('e1', acciones)).toBe(1);
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
    expect(rotacionRelativa('e1', acciones)).toBe(4);
    expect(rotacionRelativa('e2', acciones)).toBe(4);
  });

  // Capturando un solo equipo, el saque del rival no queda registrado:
  // el set arranca con nuestra recepción. Aun así el primer punto
  // nuestro es un side-out y tiene que rotarnos.
  it('rota cuando el set abre recibiendo, sin el saque del rival en el registro', () => {
    const acciones = [
      acc({ id: 'r1', rally: 1, equipoId: 'e1', tipo: 'recepcion', resultado: 'perfecta' }),
      acc({
        id: 'p1',
        rally: 1,
        ordenEnRally: 2,
        equipoId: 'e1',
        tipo: 'ataque',
        resultado: 'punto_directo',
        puntoParaEquipoId: 'e1',
      }),
    ];
    expect(rotacionRelativa('e1', acciones)).toBe(2);
  });
});

describe('rotacionActual anclada al armador', () => {
  it('sin armador cae en la relativa (arranca en 1)', () => {
    expect(rotacionActual('e1', [])).toBe(1);
    expect(rotacionActual('e1', [], null)).toBe(1);
  });

  it('arranca en la zona del armador: si abre en zona 3, es rotación 3', () => {
    expect(rotacionActual('e1', [], 3)).toBe(3);
  });

  it('sigue al armador zona a zona en sentido horario', () => {
    // armador abre en zona 3; e1 rota una vez (side-out): pasa a zona 2
    const acciones = rally(1, 'e2', 'e1');
    expect(rotacionRelativa('e1', acciones)).toBe(2);
    expect(rotacionActual('e1', acciones, 3)).toBe(2);
  });
});

describe('zonaInicialArmador', () => {
  it('devuelve la posición del armador activo', () => {
    const alineacion = [
      alin({ id: 'a', jugadorId: 'arm', posicionInicial: 4, esArmador: true }),
      alin({ id: 'b', jugadorId: 'otro', posicionInicial: 2 }),
    ];
    expect(zonaInicialArmador(alineacion, 'e1')).toBe(4);
  });

  it('null cuando no se marcó armador', () => {
    expect(zonaInicialArmador([alin({})], 'e1')).toBeNull();
  });
});

describe('zonaEnRotacion', () => {
  it('deja a cada quien donde arrancó en la rotación relativa 1', () => {
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
      alin({ id: 'a', jugadorId: 'j3', posicionInicial: 3 }),
      alin({ id: 'b', jugadorId: 'j5', posicionInicial: 5 }),
      alin({ id: 'c', jugadorId: 'libero', posicionInicial: null, esLibero: true }),
    ];
    const cancha = posicionesEnCancha(alineacion, 1, 1);
    expect(cancha).toContainEqual({ jugadorId: 'j3', zona: 3, delantero: true });
    expect(cancha).toContainEqual({ jugadorId: 'j5', zona: 5, delantero: false });
    expect(cancha).toContainEqual({ jugadorId: 'libero', zona: null, delantero: false });
  });
});
