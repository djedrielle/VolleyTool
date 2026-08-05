import { Link } from 'react-router';
import { TarjetaEquipo } from '../../components/TarjetaEquipo';
import { useEquipos } from './useEquipos';

export function PaginaEquipos() {
    const { equipos, cargando, error } = useEquipos();
    if (cargando) return <p>Cargando...</p>
    if (error) return <p>Error: {error}</p>

    return (
        <main>
            <h2>Equipos</h2>
            <div className='grid-tarjetas'>
                {equipos.map((equipo) => (
                    <Link key={equipo.id} to={`/equipos/${equipo.id}`} className='tarjeta tarjeta-equipo'>
                        <TarjetaEquipo nombre={equipo.nombre} provincia={equipo.provincia} categoria={equipo.categoria} />
                    </Link>
                ))}
            </div>
        </main>
    );
}