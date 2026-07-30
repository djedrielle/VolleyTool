import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Rol } from '../../Core/Logic/identidad/roles.js';

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

// Hook global: extrae el usuario del JWT y lo adjunta a la petición.
//
// TODO(auth): verificar la FIRMA del token contra el proveedor elegido
// (Supabase u otro) cuando se decida. Por ahora solo decodifica las
// claims SIN validar la firma — sirve para desarrollar el resto del
// sistema, pero NO debe usarse así en producción.
export async function autenticar(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return;
  const token = header.slice(7);
  try {
    const claims = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64url').toString(),
    );
    req.usuario = { id: claims.sub, rol: claims.rol, alcance: claims.alcance ?? null };
  } catch {
    // Token ilegible → la petición queda sin usuario y los guards la frenan.
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
