import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { usePartido } from './usePartidos';
import { useEquipos } from '../equipos/useEquipos';
import { ConfiguracionSet } from './ConfiguracionSet';
import { DeclararAlineacion } from './DeclararAlineacion';
import { CapturaEnVivo } from './CapturaEnVivo';
import type { SetPartido } from '../../api/captura';

type Fase = 'configuracion' | 'alineacion' | 'captura';

// Conduce los tres momentos de la planilla: escoger equipo y set,
// declarar la alineación y capturar. El estado del partido vive acá para
// que cada paso sea una pantalla chiquita y sin sorpresas.
export function PaginaCapturaPartido() {
    const { partidoId } = useParams();
    const { partido, cargando, error } = usePartido(partidoId!);
    const { equipos } = useEquipos();
    const [fase, setFase] = useState<Fase>('configuracion');
    const [set, setSet] = useState<SetPartido | null>(null);
    const [miEquipoId, setMiEquipoId] = useState<string | null>(null);

    if (cargando) return <p>Cargando partido...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!partido) return <p>No se encontró el partido.</p>;

    const nombreDe = (id: string) => equipos.find((e) => e.id === id)?.nombre ?? id;
    const colorDe = (id: string) => equipos.find((e) => e.id === id)?.color ?? '#3b82f6';

    const soyLocal = miEquipoId === partido.equipoLocalId;
    const rivalId = soyLocal ? partido.equipoVisitaId : partido.equipoLocalId;

    return (
        <main>
            <section className="panel">
                <div className="migas">
                    <Link to="/captura">Captura</Link> / {nombreDe(partido.equipoLocalId)} vs{' '}
                    {nombreDe(partido.equipoVisitaId)}
                </div>
                <h1>
                    {nombreDe(partido.equipoLocalId)} vs {nombreDe(partido.equipoVisitaId)}
                </h1>
                {miEquipoId && (
                    <div className="ce-meta">
                        Capturando a {nombreDe(miEquipoId)}
                        {set ? ` · set ${set.numero}` : ''}
                    </div>
                )}
            </section>

            {fase === 'configuracion' && (
                <ConfiguracionSet
                    partido={partido}
                    nombreDe={nombreDe}
                    onListo={(nuevo, equipoId) => {
                        setSet(nuevo);
                        setMiEquipoId(equipoId);
                        setFase('alineacion');
                    }}
                />
            )}

            {fase === 'alineacion' && set && miEquipoId && (
                <DeclararAlineacion
                    setId={set.id}
                    miEquipoId={miEquipoId}
                    torneoId={partido.torneoId}
                    onListo={() => setFase('captura')}
                />
            )}

            {fase === 'captura' && set && miEquipoId && (
                <CapturaEnVivo
                    setId={set.id}
                    numeroSet={set.numero}
                    miEquipoId={miEquipoId}
                    rivalId={rivalId}
                    torneoId={partido.torneoId}
                    soyLocal={soyLocal}
                    color={colorDe(miEquipoId)}
                    nombreDe={nombreDe}
                    onCorregirAlineacion={() => setFase('alineacion')}
                    onCerrado={() => {
                        setSet(null);
                        setFase('configuracion');
                    }}
                />
            )}
        </main>
    );
}
