import { describe, it, expect } from 'vitest';
import { validarNuevoPartido } from './partido.js';

describe('validarNuevoPartido', () => {
  it('acepta un partido válido', () => {
    expect(
      validarNuevoPartido({
        torneoId: 't1',
        fechaHora: '2026-06-12T19:30:00Z',
        equipoLocalId: 'e1',
        equipoVisitaId: 'e2',
      }),
    ).toEqual([]);
  });

  it('rechaza un equipo jugando contra sí mismo', () => {
    const errores = validarNuevoPartido({
      torneoId: 't1',
      fechaHora: '2026-06-12T19:30:00Z',
      equipoLocalId: 'e1',
      equipoVisitaId: 'e1',
    });
    expect(errores.length).toBeGreaterThan(0);
  });

  it('rechaza un partido sin fecha', () => {
    const errores = validarNuevoPartido({
      torneoId: 't1',
      fechaHora: '',
      equipoLocalId: 'e1',
      equipoVisitaId: 'e2',
    });
    expect(errores.length).toBeGreaterThan(0);
  });
});
