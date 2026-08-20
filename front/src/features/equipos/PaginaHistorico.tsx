import { useParams, Link } from 'react-router';
import { useEquipo } from './useEquipo';
import { useClasificacionDeEquipo } from './useClasificacionDeEquipo';
import { useTorneos } from '../torneos/useTorneos';
import { TarjetaTorneo } from '../../components/TarjetaTorneo';

export function PaginaHistorico() {
    const { id } = useParams();
    const { equipo, cargando: cargE, error: errE } = useEquipo(id!);
    const { filas, cargando: cargC, error: errC } = useClasificacionDeEquipo(id!);
    const { torneos, cargando: cargT, error: errT } = useTorneos();

    if (cargE || cargC || cargT) return <p>Cargando...</p>;
    const error = errE || errC || errT;
    if (error) return <p>Error: {error}</p>;
    if (!equipo) return <p>No se encontró equipo.</p>;

    // Los torneos en los que el equipo tiene resultados, del más reciente al más viejo.
    const idsDelEquipo = new Set(filas.map((f) => f.torneoId));
    const torneosDelEquipo = torneos
        .filter((t) => idsDelEquipo.has(t.id))
        .sort((a, b) => b.temporada - a.temporada);

    return (
        <main>
            <div className="migas">
                <Link to={`/equipos/${id}`}>{equipo.nombre}</Link> / Histórico
            </div>
            <h2>Torneos de {equipo.nombre}</h2>
            {torneosDelEquipo.length === 0 ? (
                <p>Este equipo todavía no ha participado en ningún torneo con resultados.</p>
            ) : (
                <div className="grid-tarjetas">
                    {torneosDelEquipo.map((torneo) => (
                        <Link key={torneo.id} to={`/torneos/${torneo.id}`} className="tarjeta tarjeta-equipo">
                            <TarjetaTorneo nombre={torneo.nombre} temporada={torneo.temporada} categoria={torneo.categoria} />
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
