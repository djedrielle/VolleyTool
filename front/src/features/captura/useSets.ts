import { useState, useEffect } from 'react';
import { setsDePartido, type SetPartido } from '../../api/captura';

// Los sets ya abiertos de un partido: sirven para saber si hay uno a
// medias que continuar o si toca abrir el siguiente.
export function useSets(partidoId: string) {
    const [sets, setSets] = useState<SetPartido[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCargando(true);
        setsDePartido(partidoId)
            .then(setSets)
            .catch((e) => setError(e.message))
            .finally(() => setCargando(false));
    }, [partidoId]);

    return { sets, cargando, error };
}
