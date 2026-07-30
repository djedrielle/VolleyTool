import { describe, it, expect } from 'vitest';
import { validarNuevoTorneo } from './torneo.js';

describe('validarNuevoTorneo', () => {
  it('acepta un torneo válido', () => {
    expect(
      validarNuevoTorneo({ nombre: 'Apertura', temporada: 2026, categoria: 'femenino' }),
    ).toEqual([]);
  });

  it('rechaza fechas incoherentes (fin antes de inicio)', () => {
    const errores = validarNuevoTorneo({
      nombre: 'Apertura',
      temporada: 2026,
      categoria: 'femenino',
      fechaInicio: '2026-06-01',
      fechaFin: '2026-05-01',
    });
    expect(errores.length).toBeGreaterThan(0);
  });
});
