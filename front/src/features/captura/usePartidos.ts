import { useState, useEffect } from 'react';
import { listarPartidos, obtenerPartido, type Partido } from '../../api/partidos';

export function usePartidos() {
    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarPartidos()
            .then(setPartidos)
            .catch((e) => setError(e.message))
            .finally(() => setCargando(false));
    }, []);

    return { partidos, cargando, error };
}

export function usePartido(id: string) {
    const [partido, setPartido] = useState<Partido | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCargando(true);
        obtenerPartido(id)
            .then(setPartido)
            .catch((e) => setError(e.message))
            .finally(() => setCargando(false));
    }, [id]);

    return { partido, cargando, error };
}
