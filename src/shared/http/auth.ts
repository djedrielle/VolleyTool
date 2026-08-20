import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Rol } from '../../Core/Logic/identidad/roles.js';
import { verificarToken } from './jwt.js';

// Usuario autenticado que se adjunta a cada petición.
export interface UsuarioAutenticado {
  id: string;
  rol: Rol;
  alcance: string | null; // p. ej. el equipoId al que está limitado; null = global
}

declare module 'fastify' {
  interface FastifyRequest {
    usuario?: UsuarioAutenticado;
  }
}

// Hook global: verifica la FIRMA del token y adjunta el usuario a la
// petición. Un token ausente, inválido o expirado deja la petición sin
// usuario; los guards (requireRole) frenan lo que esté protegido, y lo
// público sigue accesible.
export async function autenticar(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return;
  try {
    const claims = await verificarToken(header.slice(7));
    req.usuario = { id: claims.sub, rol: claims.rol, alcance: claims.alcance };
  } catch {
    // Firma inválida o token expirado → sin usuario.
  }
}

// Guard por ruta: exige que el usuario tenga uno de los roles indicados.
export function requireRole(...roles: Rol[]) {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    if (!req.usuario) {
      reply.code(401).send({ error: 'No autenticado' });
      return;
    }
    if (!roles.includes(req.usuario.rol)) {
      reply.code(403).send({ error: 'No autorizado' });
      return;
    }
  };
}
