import { describe, it, expect } from 'vitest';
import { validarNuevaPlantilla } from './plantilla.js';

describe('validarNuevaPlantilla', () => {
  it('acepta una inscripción válida', () => {
    expect(
      validarNuevaPlantilla({
        jugadorId: 'j1',
        equipoId: 'e1',
        torneoId: 't1',
        numero: 7,
        posicion: 'punta',
      }),
    ).toEqual([]);
  });

  it('rechaza un número fuera de rango', () => {
    const errores = validarNuevaPlantilla({
      jugadorId: 'j1',
      equipoId: 'e1',
      torneoId: 't1',
      numero: 0,
      posicion: 'punta',
    });
    expect(errores.length).toBeGreaterThan(0);
  });

  it('rechaza una posición inválida', () => {
    const errores = validarNuevaPlantilla({
      jugadorId: 'j1',
      equipoId: 'e1',
      torneoId: 't1',
      numero: 7,
      // @ts-expect-error posición inválida a propósito para probar la validación
      posicion: 'delantero',
    });
    expect(errores.length).toBeGreaterThan(0);
  });
});
