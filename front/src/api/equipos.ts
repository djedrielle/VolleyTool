import { apiGet } from './client';

export type Equipo = {
    id: string;
    nombre: string;
    corto: string;
    categoria: 'femenino' | 'masculino';
    provincia: string | null;
    sede: string | null;
    color: string | null;
    fundado: string | null;
};

export function listarEquipos(): Promise<Equipo[]> {
    return apiGet<Equipo[]>('/equipos');
}

export function obtenerEquipo(id: string): Promise<Equipo> {
    return apiGet<Equipo>(`/equipos/${id}`)
}