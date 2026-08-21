import { apiGet } from './client';

export type Posicion = 'armador' | 'opuesto' | 'central' | 'punta' | 'libero';

// La inscripción de un jugador en un equipo para un torneo: es de acá de
// donde salen el número de camiseta y la posición.
export type Plantilla = {
    id: string;
    jugadorId: string;
    equipoId: string;
    torneoId: string;
    numero: number;
    posicion: Posicion;
    esCapitan: boolean;
    desde: string | null;
    hasta: string | null;
};

export function listarPlantillas(): Promise<Plantilla[]> {
    return apiGet<Plantilla[]>('/plantillas');
}
