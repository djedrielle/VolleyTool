import { useState, useEffect } from 'react';
import { obtenerTorneo, type Torneo } from '../../api/torneos';

export function useTorneo(id: string) {
    const [torneo, setTorneo] = useState<Torneo | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        setCargando(true);
        setError(null);
        obtenerTorneo(id).then(setTorneo).catch((e) => setError(e.message)).finally(() => setCargando(false));
    }, [id]);
    return { torneo, cargando, error };
}