import { describe, it, expect } from 'vitest';
import { firmarToken, verificarToken } from './jwt.js';

describe('jwt', () => {
  it('firma y verifica, conservando las claims', async () => {
    const token = await firmarToken({ sub: 'u1', rol: 'administrador', alcance: null });
    const claims = await verificarToken(token);
    expect(claims).toEqual({ sub: 'u1', rol: 'administrador', alcance: null });
  });

  it('conserva el alcance', async () => {
    const token = await firmarToken({ sub: 'u2', rol: 'capturador', alcance: 'equipo-9' });
    expect((await verificarToken(token)).alcance).toBe('equipo-9');
  });

  it('rechaza un token basura', async () => {
    await expect(verificarToken('x.y.z')).rejects.toThrow();
  });
});
