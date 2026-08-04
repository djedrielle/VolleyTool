const BASE_URL = 'http://localhost:3000';

export async function apiGet<T>(ruta: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${ruta}`);
    if (!res.ok) {
        throw new Error(`El servidor respondió ${res.status}`);
    }
    return res.json() as Promise<T>;
}