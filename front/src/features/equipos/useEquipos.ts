import { useState, useEffect } from 'react';
import { listarEquipos, type Equipo } from '../../api/equipos';

export function useEquipos() {
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarEquipos()
            .then(setEquipos)
            .catch((e) => setError(e.message))
            .finally(() => setCargando(false));
    }, []);

    return { equipos, cargando, error };
}