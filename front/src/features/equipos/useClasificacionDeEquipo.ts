import { useState, useEffect } from 'react';
import { clasificacionDeEquipo, type FilaClasificacion } from '../../api/clasificacion';

export function useClasificacionDeEquipo(equipoId: string) {
    const [filas, setFilas] = useState<FilaClasificacion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCargando(true);
        setError(null);
        clasificacionDeEquipo(equipoId)
            .then(setFilas)
            .catch((e) => setError(e.message))
            .finally(() => setCargando(false));
    }, [equipoId]);

    return { filas, cargando, error };
}
