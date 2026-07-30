import { describe, it, expect } from 'vitest';
import { validarNuevoJugador } from './jugador.js';

describe('validarNuevoJugador', () => {
  it('acepta un jugador válido', () => {
    expect(
      validarNuevoJugador({ nombre: 'Ana', apellido1: 'Mora', fechaNacimiento: '2000-05-10' }),
    ).toEqual([]);
  });

  it('rechaza fecha con formato inválido', () => {
    const errores = validarNuevoJugador({
      nombre: 'Ana',
      apellido1: 'Mora',
      fechaNacimiento: '10/05/2000',
    });
    expect(errores.length).toBeGreaterThan(0);
  });

  it('rechaza altura fuera de rango', () => {
    const errores = validarNuevoJugador({
      nombre: 'Ana',
      apellido1: 'Mora',
      fechaNacimiento: '2000-05-10',
      alturaCm: 300,
    });
    expect(errores.length).toBeGreaterThan(0);
  });
});
