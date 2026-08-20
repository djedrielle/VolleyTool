import { describe, it, expect } from 'vitest';
import { hashearContrasena, verificarContrasena } from './password.js';

describe('password', () => {
  it('el hash no guarda la contraseña en claro', () => {
    const hash = hashearContrasena('secreta123');
    expect(hash).not.toContain('secreta123');
    expect(hash).toContain(':');
  });

  it('verifica la contraseña correcta', () => {
    const hash = hashearContrasena('secreta123');
    expect(verificarContrasena('secreta123', hash)).toBe(true);
  });

  it('rechaza la contraseña incorrecta', () => {
    const hash = hashearContrasena('secreta123');
    expect(verificarContrasena('otra', hash)).toBe(false);
  });

  it('dos hashes de la misma contraseña difieren (salt aleatorio)', () => {
    expect(hashearContrasena('igual')).not.toBe(hashearContrasena('igual'));
  });

  it('rechaza un almacenado malformado', () => {
    expect(verificarContrasena('x', 'sinseparador')).toBe(false);
  });
});
