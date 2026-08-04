import { apiGet } from './client';

export type Equipo = {
    id: string;
    nombre: string;
    corto: string;
    categoria: 'femenino' | 'masculino';
};

export function listarEquipos(): Promise<Equipo[]> {
    return apiGet<Equipo[]>('/equipos');
}