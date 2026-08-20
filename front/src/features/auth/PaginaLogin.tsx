import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';

export function PaginaLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    async function enviar(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setEnviando(true);
        try {
            await login(email, contrasena);
            navigate('/');
        } catch {
            setError('Correo o contraseña incorrectos.');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main>
            <section className="panel panel-estrecho">
                <h2>Iniciar sesión</h2>
                <form onSubmit={enviar}>
                    <label>
                        Correo
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Contraseña
                        <input
                            type="password"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required
                        />
                    </label>
                    {error && <p className="error">{error}</p>}
                    <button type="submit" disabled={enviando}>
                        {enviando ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </section>
        </main>
    );
}
