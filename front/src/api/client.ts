const BASE_URL = 'http://localhost:3000';

// Si hay un token guardado, se adjunta a cada petición. Es la costura
// donde el login "entra" a todas las llamadas sin que los componentes se
// enteren.
function autorizacion(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// El backend manda los errores como { error, detalles? }. Traducirlos acá
// es lo que deja que una pantalla muestre "Se necesitan 6 titulares en la
// cancha." en vez de "El servidor respondió 400".
async function fallo(res: Response): Promise<Error> {
    const cuerpo = (await res.json().catch(() => null)) as
        | { error?: string; detalles?: string[] }
        | null;
    const detalles = cuerpo?.detalles?.join(' ');
    return new Error(detalles || cuerpo?.error || `El servidor respondió ${res.status}`);
}

export async function apiGet<T>(ruta: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${ruta}`, { headers: { ...autorizacion() } });
    if (!res.ok) {
        throw await fallo(res);
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
        throw await fallo(res);
    }
    return res.json() as Promise<T>;
}

export async function apiPut<T>(ruta: string, cuerpo: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${ruta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...autorizacion() },
        body: JSON.stringify(cuerpo),
    });
    if (!res.ok) {
        throw await fallo(res);
    }
    return res.json() as Promise<T>;
}
