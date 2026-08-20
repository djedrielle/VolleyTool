import { ROLES, type Rol } from '../identidad/roles.js';

// El usuario tal como se lee: SIN el hash de la contraseña, que nunca
// sale del backend.
export interface Usuario {
  id: string;
  email: string;
  rol: Rol;
  alcance: string | null;
  creadoEn: Date;
}

// Datos para crear un usuario. La contraseña llega en claro y se hashea
// antes de guardar; jamás se persiste ni se devuelve en claro.
export interface NuevoUsuario {
  email: string;
  contrasena: string;
  rol?: Rol;
  alcance?: string | null;
}

export function validarNuevoUsuario(u: NuevoUsuario): string[] {
  const errores: string[] = [];
  if (!u.email?.includes('@')) errores.push('El correo no es válido.');
  if (!u.contrasena || u.contrasena.length < 8)
    errores.push('La contraseña debe tener al menos 8 caracteres.');
  if (u.rol != null && !ROLES.includes(u.rol)) errores.push('El rol no es válido.');
  return errores;
}
