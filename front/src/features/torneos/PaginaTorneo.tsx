import { useParams } from 'react-router';
import { useTorneo } from './useTorneo';
import { useClasificacion } from './useClasificacion';
import { useEquipos } from '../equipos/useEquipos';
import { TablaPosiciones } from '../../components/TablaPosiciones';

export function PaginaTorneo() {
    const { id } = useParams();
    const { torneo, cargando: cargT, error: errT } = useTorneo(id!);
    const { filas, cargando: cargC, error: errC } = useClasificacion(id!);
    const { equipos, cargando: cargE, error: errE } = useEquipos();

    if (cargT || cargC || cargE) return <p>Cargando…</p>;
    const error = errT || errC || errE;
    if (error) return <p>Error: {error}</p>;
    if (!torneo) return <p>No se encontró el torneo.</p>;

    const nombreDe = (equipoId: string) => equipos.find((e) => e.id === equipoId)?.nombre ?? equipoId;

    return (
        <main>
            <h1>{torneo.nombre}</h1>
            <div>Temporada {torneo.temporada} · {torneo.categoria}</div>
            {filas.length === 0 ? <p>Todavía no hay resultados en este torneo...</p> : <TablaPosiciones filas={filas} nombreDe={nombreDe} />}
        </main>
    )
}