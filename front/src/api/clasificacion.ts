import { apiGet } from './client';

export type FilaClasificacion = {
    torneoId: string;
    equipoId: string;
    pj: number;
    pg: number;
    pp: number;
    setsFavor: number;
    setsContra: number;
    puntos: number;
};

export function clasificacionDeTorneo(torneoId: string): Promise<FilaClasificacion[]> {
    return apiGet<FilaClasificacion[]>(`/metricas/torneos/${torneoId}/clasificacion`);
}

export function clasificacionDeEquipo(equipoId: string): Promise<FilaClasificacion[]> {
    return apiGet<FilaClasificacion[]>(`/metricas/equipos/${equipoId}/clasificacion`);
}