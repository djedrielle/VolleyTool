import { useParams, Link } from 'react-router';
import { useEquipo } from './useEquipo';

export function PaginaEquipo() {
    const { id } = useParams();
    const { equipo, cargando, error } = useEquipo(id!);

    if (cargando) return <p>Cargando...</p>
    if (error) return <p>Error: {error}</p>
    if (!equipo) return <p>No se encontró equipo.</p>

    return (
        <main>
            <Link to="/equipos">Voler</Link>
            <h1>{equipo.nombre} ({equipo.corto})</h1>
            <p>Categoría: {equipo.categoria}</p>
            {equipo.provincia && <p>Provincia: {equipo.provincia}</p>}
        </main>
    );
}