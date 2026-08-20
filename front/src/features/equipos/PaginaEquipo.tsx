import { useParams, Link } from 'react-router';
import { useEquipo } from './useEquipo';
import type { CSSProperties } from 'react';

export function PaginaEquipo() {
    const { id } = useParams();
    const { equipo, cargando, error } = useEquipo(id!);

    if (cargando) return <p>Cargando...</p>
    if (error) return <p>Error: {error}</p>
    if (!equipo) return <p>No se encontró equipo.</p>

    // Hay que obtener la informacion de la tabla de posiciones
    // de ahi se obtiene los valores que van en los campos:
    // posicion, record, sets. Luego hay que ver donde o como
    // la informacion para hacer la lista de racha...

    /* Queda para luego, necesitamos hacer el enrutamiento
    const tabs = [['plantilla', 'Plantilla'], ['estadisticas', 'Estadísticas'], ['partidos', 'Partidos'], ['videos', 'Videos']];
    let cuerpo = '';
    if (tab === 'plantilla') cuerpo = tabPlantilla(equipo);
    else if (tab === 'estadisticas') cuerpo = tabEstadisticas(equipo);
    else if (tab === 'partidos') cuerpo = tabPartidosEquipo(equipo);
    else if (tab === 'videos') cuerpo = tabVideosEquipo(equipo);
    */
    const meta = [equipo.sede, equipo.fundado ? `Fundado en ${equipo.fundado}` : null].filter(Boolean).join(' · ');

    return (
        <main>
            <section className="cab-equipo" style={{ '--c': equipo.color ?? '#3b82f6' } as CSSProperties}>
                <div className="ce-principal">
                    <div>
                        <div className="migas">
                            <Link to="/equipos">Equipos</Link> / {equipo.categoria}
                            <Link to="/torneos" className="chip">Histórico</Link>
                        </div>
                        <h1>{equipo.nombre}</h1>
                        {meta && <div className="ce-meta">{meta}</div>}
                    </div>
                </div>
            </section>
        </main>
    );
}