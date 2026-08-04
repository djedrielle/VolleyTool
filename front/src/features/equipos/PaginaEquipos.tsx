import { Link } from 'react-router';
import { TarjetaEquipo } from '../../components/TarjetaEquipo';
import { useEquipos } from './useEquipos';

export function PaginaEquipos() {
    const { equipos, cargando, error } = useEquipos();
    if (cargando) return <p>Cargando...</p>
    if (error) return <p>Error: {error}</p>

    return (
        <main>
            <h1>Equipos</h1>
            <section className='lista-equipos'>
                {equipos.map((equipo) => (
                    <Link key={equipo.id} to={`/equipos/${equipo.id}`}>
                        <TarjetaEquipo nombre={equipo.nombre} corto={equipo.corto} categoria={equipo.categoria} />
                    </Link>
                ))}
            </section>
        </main>
    );
}