import { describe, it, expect } from 'vitest';
import { validarNuevaAccion } from './accion.js';

const base = {
  setId: 's1',
  equipoId: 'e1',
  jugadorId: 'j1',
  rally: 1,
  ordenEnRally: 1,
  rotacion: 3,
} as const;

describe('validarNuevaAccion', () => {
  it('acepta un saque con resultado válido', () => {
    expect(validarNuevaAccion({ ...base, tipo: 'saque', resultado: 'ace' })).toEqual([]);
  });

  it('rechaza un resultado que no corresponde al tipo', () => {
    // 'ace' es de saque, no de ataque
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
