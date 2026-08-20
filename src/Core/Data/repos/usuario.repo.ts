import { eq } from 'drizzle-orm';
import { db as dbCompartida } from '../../../shared/db/client.js';
import { usuario } from '../schema/usuario.js';
import type { Usuario } from '../../Logic/dominio/usuario.js';
import type { UsuarioRepo, UsuarioConHash } from '../../Logic/identidad/identidad.service.js';
import type { Rol } from '../../Logic/identidad/roles.js';

function aDominio(fila: typeof usuario.$inferSelect): Usuario {
  return {
    id: fila.id,
    email: fila.email,
    rol: fila.rol,
    alcance: fila.alcance,
    creadoEn: fila.creadoEn,
  };
}

export class DrizzleUsuarioRepo implements UsuarioRepo {
  constructor(private readonly db = dbCompartida) {}

  async crear(datos: {
    email: string;
    hashContrasena: string;
    rol: Rol;
    alcance: string | null;
  }): Promise<Usuario> {
    const [fila] = await this.db.insert(usuario).values(datos).returning();
    return aDominio(fila!);
  }

  async buscarPorEmail(email: string): Promise<UsuarioConHash | null> {
    const [fila] = await this.db.select().from(usuario).where(eq(usuario.email, email));
    if (!fila) return null;
    return { ...aDominio(fila), hashContrasena: fila.hashContrasena };
  }
}
