import { useState, useEffect } from 'react';
import { listarTorneos, type Torneo } from '../../api/torneos';

export function useTorneos() {
    const [torneos, setTorneos] = useState<Torneo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { listarTorneos().then(setTorneos).catch((e) => setError(e.message)).finally(() => setCargando(false)) }, []);
    return { torneos, cargando, error };
}