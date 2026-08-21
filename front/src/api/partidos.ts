import { apiGet } from './client';

export type EstadoPartido = 'programado' | 'en_vivo' | 'finalizado' | 'suspendido';

export type Partido = {
    id: string;
    torneoId: string;
    jornada: number | null;
    fechaHora: string; // ISO 8601
    sede: string | null;
    estado: EstadoPartido;
    equipoLocalId: string;
    equipoVisitaId: string;
};

export function listarPartidos(): Promise<Partido[]> {
    return apiGet<Partido[]>('/partidos');
}

export function obtenerPartido(id: string): Promise<Partido> {
    return apiGet<Partido>(`/partidos/${id}`);
}
