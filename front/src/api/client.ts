const BASE_URL = 'http://localhost:3000';

// Si hay un token guardado, se adjunta a cada petición. Es la costura
// donde el login "entra" a todas las llamadas sin que los componentes se
// enteren.
function autorizacion(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(ruta: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${ruta}`, { headers: { ...autorizacion() } });
    if (!res.ok) {
        throw new Error(`El servidor respondió ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export async function apiPost<T>(ruta: string, cuerpo: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${ruta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...autorizacion() },
        body: JSON.stringify(cuerpo),
    });
    if (!res.ok) {
        throw new Error(`El servidor respondió ${res.status}`);
    }
    return res.json() as Promise<T>;
}
