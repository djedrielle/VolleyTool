import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env.js';
import type { Rol } from '../../Core/Logic/identidad/roles.js';

// Firma y verificación de los JWT que emite el login. HS256 con un
// secreto compartido: nosotros emitimos y nosotros verificamos, así que
// no hay negociación de algoritmo que abra la puerta a confusiones.
const secreto = new TextEncoder().encode(env.JWT_SECRET);
const ALGORITMO = 'HS256';

export interface ClaimsToken {
  sub: string;
  rol: Rol;
  alcance: string | null;
}

export async function firmarToken(claims: ClaimsToken): Promise<string> {
  return new SignJWT({ rol: claims.rol, alcance: claims.alcance })
    .setProtectedHeader({ alg: ALGORITMO })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secreto);
}

export async function verificarToken(token: string): Promise<ClaimsToken> {
  const { payload } = await jwtVerify(token, secreto, { algorithms: [ALGORITMO] });
  return {
    sub: payload.sub as string,
    rol: payload.rol as Rol,
    alcance: (payload.alcance as string | null) ?? null,
  };
}
