import { apiGet, apiPost, apiPut } from './client';

// El camino de ESCRITURA de Metrics. Todo lo que sale de la planilla en
// vivo pasa por acá; los GET son públicos, los POST/PUT exigen el rol de
// capturador o administrador (el token lo pone el cliente).

export type TipoAccion = 'saque' | 'recepcion' | 'colocacion' | 'ataque' | 'bloqueo' | 'defensa';

export type ResultadoAccion =
    | 'ace'
    | 'recibido'
    | 'perfecta'
    | 'fuera_sistema'
    | 'ok'
    | 'punto_directo'
    | 'defendido'
    | 'exitosa'
    | 'error';

export type SetPartido = {
    id: string;
    partidoId: string;
    numero: number;
    puntosCasa: number;
    puntosVisita: number;
    cerrado: boolean;
};

// `puntoParaEquipoId` nulo = el rally sigue; con valor = esta acción lo
// cerró. `corrigeAccionId` con valor = es una anulación (un "deshacer"):
// ni ella ni la acción que señala cuentan.
export type Accion = {
    id: string;
    setId: string;
    equipoId: string;
    jugadorId: string;
    rally: number;
    ordenEnRally: number;
    rotacion: number;
    tipo: TipoAccion;
    resultado: ResultadoAccion;
    puntoParaEquipoId: string | null;
    corrigeAccionId: string | null;
    registradoEn: string;
    registradoPor: string | null;
};

// La rotación no se manda: el backend la deduce de la seguidilla de
// puntos, anclada a la zona del armador.
export type NuevaAccion = {
    equipoId: string;
    jugadorId: string;
    rally: number;
    ordenEnRally: number;
    tipo: TipoAccion;
    resultado: ResultadoAccion;
    puntoParaEquipoId?: string | null;
};

export type JugadorAlineado = {
    jugadorId: string;
    posicionInicial?: number | null;
    esArmador?: boolean;
    esLibero?: boolean;
};

export type Alineacion = {
    id: string;
    setId: string;
    equipoId: string;
    jugadorId: string;
    posicionInicial: number | null;
    esArmador: boolean;
    esLibero: boolean;
    entraEnRally: number | null;
    saleEnRally: number | null;
};

export type PosicionEnCancha = {
    jugadorId: string;
    zona: number | null; // null = líbero, no entra en el giro
    delantero: boolean;
};

export type CanchaEquipo = {
    equipoId: string;
    rally: number;
    rotacion: number;
    jugadores: PosicionEnCancha[];
};

export function setsDePartido(partidoId: string): Promise<SetPartido[]> {
    return apiGet<SetPartido[]>(`/captura/partidos/${partidoId}/sets`);
}

export function abrirSet(partidoId: string, numero: number): Promise<SetPartido> {
    return apiPost<SetPartido>('/captura/sets', { partidoId, numero });
}

export function accionesDeSet(setId: string): Promise<Accion[]> {
    return apiGet<Accion[]>(`/captura/sets/${setId}/acciones`);
}

export function registrarAccion(setId: string, accion: NuevaAccion): Promise<Accion> {
    return apiPost<Accion>(`/captura/sets/${setId}/acciones`, accion);
}

export function alineacionDeSet(setId: string): Promise<Alineacion[]> {
    return apiGet<Alineacion[]>(`/captura/sets/${setId}/alineacion`);
}

export function declararAlineacion(
    setId: string,
    equipoId: string,
    jugadores: JugadorAlineado[],
): Promise<Alineacion[]> {
    return apiPut<Alineacion[]>(`/captura/sets/${setId}/alineacion`, { equipoId, jugadores });
}

export function cancha(setId: string): Promise<CanchaEquipo[]> {
    return apiGet<CanchaEquipo[]>(`/captura/sets/${setId}/cancha`);
}

export function deshacer(setId: string): Promise<Accion> {
    return apiPost<Accion>(`/captura/sets/${setId}/deshacer`, {});
}

export function cerrarSet(
    setId: string,
    puntosCasa: number,
    puntosVisita: number,
): Promise<SetPartido> {
    return apiPost<SetPartido>(`/captura/sets/${setId}/cerrar`, { puntosCasa, puntosVisita });
}
