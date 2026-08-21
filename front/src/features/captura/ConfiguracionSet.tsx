import { useState } from 'react';
import { abrirSet, type SetPartido } from '../../api/captura';
import type { Partido } from '../../api/partidos';
import { useSets } from './useSets';

type Props = {
    partido: Partido;
    nombreDe: (equipoId: string) => string;
    onListo: (set: SetPartido, miEquipoId: string) => void;
};

// Paso 1: qué equipo se captura y en qué set. Se captura UN equipo por
// planilla; el rival entra al marcador por los puntos que nos gana.
export function ConfiguracionSet({ partido, nombreDe, onListo }: Props) {
    const { sets, cargando, error } = useSets(partido.id);
    const [miEquipoId, setMiEquipoId] = useState<string | null>(null);
    const [abriendo, setAbriendo] = useState(false);
    const [fallo, setFallo] = useState<string | null>(null);

    if (cargando) return <section className="panel"><p>Cargando sets...</p></section>;
    if (error) return <section className="panel"><p>Error: {error}</p></section>;

    const abierto = sets.find((s) => !s.cerrado) ?? null;
    const siguiente = sets.length ? Math.max(...sets.map((s) => s.numero)) + 1 : 1;

    async function nuevoSet() {
        if (!miEquipoId) return;
        setAbriendo(true);
        setFallo(null);
        try {
            onListo(await abrirSet(partido.id, siguiente), miEquipoId);
        } catch (e) {
            setFallo((e as Error).message);
        } finally {
            setAbriendo(false);
        }
    }

    return (
        <>
            <section className="panel">
                <h2>1 · ¿Cuál equipo vas a capturar?</h2>
                <div className="cm-controles">
                    {[partido.equipoLocalId, partido.equipoVisitaId].map((id) => (
                        <button
                            key={id}
                            type="button"
                            className={`boton ${miEquipoId === id ? 'boton-primario' : ''}`}
                            onClick={() => setMiEquipoId(id)}
                        >
                            {nombreDe(id)}
                            {id === partido.equipoLocalId ? ' (local)' : ' (visita)'}
                        </button>
                    ))}
                </div>
            </section>

            <section className="panel">
                <h2>2 · El set</h2>
                {!miEquipoId && <p>Primero escogé el equipo.</p>}

                {sets.length > 0 && (
                    <div className="log-acciones">
                        {sets.map((s) => (
                            <div key={s.id} className="log-item">
                                Set {s.numero} · {s.puntosCasa}–{s.puntosVisita} ·{' '}
                                {s.cerrado ? 'cerrado' : 'abierto'}
                            </div>
                        ))}
                    </div>
                )}

                <div className="cm-controles">
                    {abierto && (
                        <button
                            type="button"
                            className="boton boton-primario"
                            disabled={!miEquipoId}
                            onClick={() => onListo(abierto, miEquipoId!)}
                        >
                            Continuar el set {abierto.numero}
                        </button>
                    )}
                    <button
                        type="button"
                        className="boton"
                        // Con un set a medias no tiene sentido abrir otro:
                        // primero se cierra el que está en juego.
                        disabled={!miEquipoId || abierto !== null || abriendo}
                        onClick={nuevoSet}
                    >
                        {abriendo ? 'Abriendo...' : `Abrir el set ${siguiente}`}
                    </button>
                </div>

                {fallo && <p className="error">{fallo}</p>}
            </section>
        </>
    );
}
