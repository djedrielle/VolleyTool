import { useTorneoActual } from './useTorneoActual';
import { useEquipos } from './useEquipos';
import { TablaPosiciones } from '../../components/TablaPosiciones';

// La tabla del torneo actual del equipo, con el equipo resaltado. Carga
// aparte del encabezado, así el perfil se pinta al instante y la tabla
// llega cuando esté lista.
export function TorneoActual({ equipoId }: { equipoId: string }) {
    const { torneo, filas, cargando, error } = useTorneoActual(equipoId);
    const { equipos } = useEquipos();

    if (cargando) return <section className="panel"><p>Cargando torneo actual...</p></section>;
    if (error) return <section className="panel"><p>Error: {error}</p></section>;
    if (!torneo) {
        return (
            <section className="panel">
                <p>Este equipo no tiene un torneo activo en este momento.</p>
            </section>
        );
    }

    const nombreDe = (id: string) => equipos.find((e) => e.id === id)?.nombre ?? id;

    return (
        <section className="panel">
            <h2>Posiciones · {torneo.nombre}</h2>
            <TablaPosiciones filas={filas} nombreDe={nombreDe} equipoResaltado={equipoId} />
        </section>
    );
}
