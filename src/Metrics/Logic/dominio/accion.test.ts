import { describe, it, expect } from 'vitest';
import { validarNuevaAccion, accionesVigentes } from './accion.js';
import type { Accion } from './accion.js';

const base = {
  setId: 's1',
  equipoId: 'e1',
  jugadorId: 'j1',
  rally: 1,
  ordenEnRally: 1,
  rotacion: 3,
} as const;

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

describe('validarNuevaAccion', () => {
  it('acepta un saque con resultado válido', () => {
    expect(validarNuevaAccion({ ...base, tipo: 'saque', resultado: 'ace' })).toEqual([]);
  });

  it('rechaza un resultado que no corresponde al tipo', () => {
    const errores = validarNuevaAccion({ ...base, tipo: 'ataque', resultado: 'ace' });
    expect(errores.length).toBeGreaterThan(0);
  });

  it('rechaza una rotación fuera de 1–6', () => {
    const errores = validarNuevaAccion({ ...base, rotacion: 7, tipo: 'ataque', resultado: 'punto_directo' });
    expect(errores.length).toBeGreaterThan(0);
  });

  it('rechaza un rally no positivo', () => {
    const errores = validarNuevaAccion({ ...base, rally: 0, tipo: 'defensa', resultado: 'exitosa' });
    expect(errores.length).toBeGreaterThan(0);
  });
});

describe('accionesVigentes', () => {
  it('descarta la acción anulada y su anulación', () => {
    const vigentes = accionesVigentes([acc({ id: 'a1' }), acc({ id: 'a2', corrigeAccionId: 'a1' })]);
    expect(vigentes).toEqual([]);
  });

  it('conserva las acciones que no fueron anuladas', () => {
    const vigentes = accionesVigentes([
      acc({ id: 'a1' }),
      acc({ id: 'a2' }),
      acc({ id: 'a3', corrigeAccionId: 'a2' }),
    ]);
    expect(vigentes.map((a) => a.id)).toEqual(['a1']);
  });
});
