// Roles del sistema. La AUTORIZACIÓN (qué puede cada rol) es lógica de
// dominio y vive acá, en Core. La AUTENTICACIÓN (probar quién sos) se
// delega al proveedor externo (Supabase u otro) y se conecta en
// shared/http/auth.ts.

export type Rol = 'usuario_normal' | 'capturador' | 'administrador';

export const ROLES: readonly Rol[] = ['usuario_normal', 'capturador', 'administrador'];
