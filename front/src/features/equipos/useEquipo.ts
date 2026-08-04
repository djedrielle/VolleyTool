import { useState, useEffect } from 'react';
import { obtenerEquipo, type Equipo } from '../../api/equipos';

export function useEquipo(id: string) {
    const [equipo, setEquipo] = useState<Equipo | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCargando(true);
        setError(null);
        obtenerEquipo(id)
            .then((datos) => (setEquipo(datos))) // alternativa .then(setEquipo)
            .catch((e) => (setError(e.message)))
            .finally(() => setCargando(false));
    }, [id]);

    return { equipo, cargando, error };
}