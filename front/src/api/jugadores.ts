import { apiGet } from './client';

// La ficha de la persona. El número y la posición NO viven acá: son de la
// inscripción en un torneo (ver plantillas.ts).
export type Jugador = {
    id: string;
    nombre: string;
    apellido1: string;
    apellido2: string | null;
    fechaNacimiento: string; // YYYY-MM-DD
    nacionalidad: string;
    alturaCm: number | null;
};

export function listarJugadores(): Promise<Jugador[]> {
    return apiGet<Jugador[]>('/jugadores');
}

export function obtenerJugador(id: string): Promise<Jugador> {
    return apiGet<Jugador>(`/jugadores/${id}`);
}
