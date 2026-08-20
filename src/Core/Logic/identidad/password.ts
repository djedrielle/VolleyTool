import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Hash de contraseña con scrypt, nativo de Node (sin dependencias).
// Guarda "salt:hash" en hex; verificar recomputa el hash con el mismo
// salt y compara en tiempo constante, para no filtrar información por el
// tiempo de respuesta.
const LARGO_CLAVE = 64;

export function hashearContrasena(contrasena: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(contrasena, salt, LARGO_CLAVE);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verificarContrasena(contrasena: string, almacenado: string): boolean {
  const [saltHex, hashHex] = almacenado.split(':');
  if (!saltHex || !hashHex) return false;
  const esperado = Buffer.from(hashHex, 'hex');
  const calculado = scryptSync(contrasena, Buffer.from(saltHex, 'hex'), LARGO_CLAVE);
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}
