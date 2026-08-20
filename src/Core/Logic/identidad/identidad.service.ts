import { validarNuevoUsuario, type NuevoUsuario, type Usuario } from '../dominio/usuario.js';
import { hashearContrasena, verificarContrasena } from './password.js';
import { firmarToken } from '../../../shared/http/jwt.js';
import { ErrorValidacion, CredencialesInvalidas } from '../../../shared/errors.js';
import type { Rol } from './roles.js';

// El repo devuelve el hash SOLO para el login; el resto del sistema usa
// el Usuario público (sin hash).
export interface UsuarioConHash extends Usuario {
  hashContrasena: string;
}

// Puerto: crear un usuario ya hasheado y buscarlo por email.
export interface UsuarioRepo {
  crear(datos: {
    email: string;
    hashContrasena: string;
    rol: Rol;
    alcance: string | null;
  }): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<UsuarioConHash | null>;
}

export class IdentidadService {
  constructor(private readonly repo: UsuarioRepo) {}

  // Crea un usuario: valida, hashea la contraseña y guarda. Nunca ve ni
  // devuelve la contraseña en claro.
  async crear(datos: NuevoUsuario): Promise<Usuario> {
    const errores = validarNuevoUsuario(datos);
    if (errores.length) throw new ErrorValidacion(errores);
    return this.repo.crear({
      email: datos.email.toLowerCase().trim(),
      hashContrasena: hashearContrasena(datos.contrasena),
      rol: datos.rol ?? 'usuario_normal',
      alcance: datos.alcance ?? null,
    });
  }

  // Login: verifica la contraseña y emite un token firmado. El mismo
  // error para "no existe" y "clave mala", así no se revela qué correos
  // están registrados.
  async login(email: string, contrasena: string): Promise<{ token: string; usuario: Usuario }> {
    const encontrado = await this.repo.buscarPorEmail(email.toLowerCase().trim());
    if (!encontrado || !verificarContrasena(contrasena, encontrado.hashContrasena))
      throw new CredencialesInvalidas();

    const { hashContrasena: _omit, ...usuario } = encontrado;
    const token = await firmarToken({ sub: usuario.id, rol: usuario.rol, alcance: usuario.alcance });
    return { token, usuario };
  }
}
