import { apiGet } from './client';

export type Torneo = {
    id: string;
    nombre: string;
    temporada: number;
    categoria: 'femenino' | 'masculino';
    fechaInicio: string | null;
    fechaFin: string | null;
    formato: string | null;
};

export function listarTorneos(): Promise<Torneo[]> {
    return apiGet<Torneo[]>('/torneos');
}

export function obtenerTorneo(id: string): Promise<Torneo> {
    return apiGet<Torneo>(`/torneos/${id}`);
}