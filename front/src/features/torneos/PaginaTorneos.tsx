import { Link } from 'react-router';
import { TarjetaTorneo } from '../../components/TarjetaTorneo';
import { useTorneos } from './useTorneos';

export function PaginaTorneos() {
    const { torneos, cargando, error } = useTorneos();

    if (cargando) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <main>
            <h2>Torneos</h2>
            <div className="grid-tarjetas">
                {torneos.map((torneo) => (
                    <Link key={torneo.id} to={`/torneos/${torneo.id}`} className="tarjeta tarjeta-equipo">
                        <TarjetaTorneo nombre={torneo.nombre} temporada={torneo.temporada} categoria={torneo.categoria} />
                    </Link>
                ))}
            </div>
        </main>
    );
}