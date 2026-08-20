import { createContext, useContext, useState, type ReactNode } from 'react';
import { login as apiLogin, type Usuario } from '../../api/auth';

// Estado de sesión compartido por toda la app vía contexto. El token y el
// usuario se guardan en localStorage para sobrevivir a un refresco.
type AuthCtx = {
    usuario: Usuario | null;
    login: (email: string, contrasena: string) => Promise<void>;
    logout: () => void;
};

const Contexto = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(() => {
        const guardado = localStorage.getItem('usuario');
        return guardado ? (JSON.parse(guardado) as Usuario) : null;
    });

    async function login(email: string, contrasena: string) {
        const datos = await apiLogin(email, contrasena);
        localStorage.setItem('token', datos.token);
        localStorage.setItem('usuario', JSON.stringify(datos.usuario));
        setUsuario(datos.usuario);
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
    }

    return <Contexto.Provider value={{ usuario, login, logout }}>{children}</Contexto.Provider>;
}

export function useAuth() {
    const ctx = useContext(Contexto);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
}
