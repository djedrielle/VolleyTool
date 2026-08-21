import { Navigate } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import type { Rol } from '../api/auth';

// El guard del backend (requireRole) tiene su espejo acá: sin sesión se
// manda al login, y con la sesión equivocada se explica en vez de dejar
// que la pantalla se estrelle contra un 403.
export function RutaProtegida({ roles, children }: { roles: Rol[]; children: ReactNode }) {
    const { usuario } = useAuth();

    if (!usuario) return <Navigate to="/login" replace />;

    if (!roles.includes(usuario.rol)) {
        return (
            <main>
                <section className="panel panel-estrecho">
                    <h2>Sin permiso</h2>
                    <p>Esta pantalla es para capturadores. Tu cuenta es de tipo {usuario.rol}.</p>
                </section>
            </main>
        );
    }

    return <>{children}</>;
}
