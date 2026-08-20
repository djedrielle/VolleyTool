import { useState, useEffect } from 'react';
import { clasificacionDeTorneo, type FilaClasificacion } from '../../api/clasificacion';

export function useClasificacion(torneoId: string) {
    const [filas, setFilas] = useState<FilaClasificacion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        setCargando(true);
        setError(null);
        clasificacionDeTorneo(torneoId).then(setFilas).catch((e) => setError(e.message)).finally(() => setCargando(false));
    }, [torneoId]);
    return { filas, cargando, error };
}