import { useState, useEffect } from 'react';
import { clasificacionDeEquipo, clasificacionDeTorneo, type FilaClasificacion } from '../../api/clasificacion';
import { listarTorneos, type Torneo } from '../../api/torneos';

// El torneo activo por fecha (hoy entre fechaInicio y fechaFin) en el que
// participa el equipo, junto con su tabla de posiciones. Si no hay ninguno
// activo, `torneo` queda en null.
export function useTorneoActual(equipoId: string) {
    const [torneo, setTorneo] = useState<Torneo | null>(null);
    const [filas, setFilas] = useState<FilaClasificacion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCargando(true);
        setError(null);
        (async () => {
            try {
                // En paralelo: en qué torneos está el equipo, y todos los torneos.
                const [delEquipo, torneos] = await Promise.all([
                    clasificacionDeEquipo(equipoId),
                    listarTorneos(),
                ]);
                const idsDelEquipo = new Set(delEquipo.map((f) => f.torneoId));
                const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
                const activo =
                    torneos.find(
                        (t) =>
                            idsDelEquipo.has(t.id) &&
                            t.fechaInicio !== null &&
                            t.fechaFin !== null &&
                            t.fechaInicio <= hoy &&
                            hoy <= t.fechaFin,
                    ) ?? null;

                setTorneo(activo);
                setFilas(activo ? await clasificacionDeTorneo(activo.id) : []);
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setCargando(false);
            }
        })();
    }, [equipoId]);

    return { torneo, filas, cargando, error };
}
