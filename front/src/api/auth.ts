import { apiPost } from './client';

export type Rol = 'usuario_normal' | 'capturador' | 'administrador';

export type Usuario = {
    id: string;
    email: string;
    rol: Rol;
    alcance: string | null;
};

export function login(
    email: string,
    contrasena: string,
): Promise<{ token: string; usuario: Usuario }> {
    return apiPost('/auth/login', { email, contrasena });
}
