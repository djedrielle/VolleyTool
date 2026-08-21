import { useState } from 'react';
import { Link } from 'react-router';
import { usePartidos } from './usePartidos';
import { useEquipos } from '../equipos/useEquipos';
import type { EstadoPartido } from '../../api/partidos';

const ETIQUETA_ESTADO: Record<EstadoPartido, string> = {
    programado: 'Programado',
    en_vivo: '● En vivo',
    finalizado: 'Finalizado',
    suspendido: 'Suspendido',
};

const CLASE_ESTADO: Record<EstadoPartido, string> = {
    programado: 'badge badge-prog',
    en_vivo: 'badge badge-vivo',
    finalizado: 'badge',
    suspendido: 'badge',
};

const fecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' });

const hora = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });

// La puerta de entrada a la planilla: escoger qué partido se va a
// capturar. Se ordenan por cercanía a hoy, que es casi siempre el que el
// capturador anda buscando.
export function PaginaCaptura() {
    const { partidos, cargando, error } = usePartidos();
    const { equipos } = useEquipos();
    // La hora se toma una sola vez al montar: si no, el orden bailaría
    // en cada render.
    const [ahora] = useState(() => Date.now());

    if (cargando) return <p>Cargando partidos...</p>;
    if (error) return <p>Error: {error}</p>;

    const nombreDe = (id: string) => equipos.find((e) => e.id === id)?.nombre ?? id;

    const ordenados = [...partidos].sort(
        (a, b) =>
            Math.abs(Date.parse(a.fechaHora) - ahora) - Math.abs(Date.parse(b.fechaHora) - ahora),
    );

    return (
        <main>
            <section className="panel">
                <h1>Captura en vivo</h1>
                <p>Escogé el partido que vas a capturar.</p>
            </section>

            {ordenados.length === 0 ? (
                <section className="panel">
                    <p>Todavía no hay partidos programados.</p>
                </section>
            ) : (
                <div className="grid-tarjetas">
                    {ordenados.map((p) => (
                        <Link key={p.id} to={`/captura/${p.id}`} className="tarjeta tarjeta-partido">
                            <div className="tp-meta">
                                <span>
                                    {fecha(p.fechaHora)} · {hora(p.fechaHora)}
                                    {p.jornada ? ` · J${p.jornada}` : ''}
                                </span>
                                <span className={CLASE_ESTADO[p.estado]}>
                                    {ETIQUETA_ESTADO[p.estado]}
                                </span>
                            </div>
                            <div className="tp-cuerpo">
                                <div className="tp-equipo">
                                    <span>{nombreDe(p.equipoLocalId)}</span>
                                </div>
                                <div className="tp-centro">
                                    <div className="detalle-sets">vs</div>
                                </div>
                                <div className="tp-equipo tp-der">
                                    <span>{nombreDe(p.equipoVisitaId)}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
