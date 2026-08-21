import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useSetEnVivo } from './useSetEnVivo';
import { usePlantilla } from './usePlantilla';
import { GRUPOS, botonDe, type BotonAccion } from './acciones';

type Props = {
    setId: string;
    numeroSet: number;
    miEquipoId: string;
    rivalId: string;
    torneoId: string;
    soyLocal: boolean;
    color: string;
    nombreDe: (equipoId: string) => string;
    onCerrado: () => void;
    onCorregirAlineacion: () => void;
};

// La planilla en vivo. El capturador siempre hace lo mismo: escoge al
// jugador y después la acción. Mientras escoge una cosa, la otra queda
// apagada, así el dedo no tiene dónde equivocarse.
export function CapturaEnVivo({
    setId,
    numeroSet,
    miEquipoId,
    rivalId,
    torneoId,
    soyLocal,
    color,
    nombreDe,
    onCerrado,
    onCorregirAlineacion,
}: Props) {
    const vivo = useSetEnVivo(setId, miEquipoId, rivalId, soyLocal);
    const { jugadores } = usePlantilla(miEquipoId, torneoId);
    const [jugadorSel, setJugadorSel] = useState<string | null>(null);

    if (vivo.cargando) return <section className="panel"><p>Cargando el set...</p></section>;

    const fichaDe = (id: string) => jugadores.find((j) => j.jugadorId === id);
    const nombreJugador = (id: string) => fichaDe(id)?.nombre ?? id;

    // Primero los seis de la cancha por zona, y el líbero (sin zona) al final.
    const enCancha = [...vivo.enCancha].sort((a, b) => (a.zona ?? 99) - (b.zona ?? 99));

    async function elegirAccion(boton: BotonAccion) {
        if (!jugadorSel) return;
        await vivo.registrar(jugadorSel, boton);
        setJugadorSel(null);
    }

    async function cerrarSet() {
        const marcador = `${vivo.puntosMios}–${vivo.puntosRival}`;
        if (!confirm(`¿Cerrar el set ${numeroSet} con ${marcador}?`)) return;
        await vivo.cerrar();
    }

    if (vivo.cerrado) {
        return (
            <section className="panel">
                <h2>Set {numeroSet} cerrado</h2>
                <p>
                    Quedó {vivo.puntosMios}–{vivo.puntosRival}. Las métricas del partido ya se
                    recalcularon.
                </p>
                <div className="cm-controles">
                    <button type="button" className="boton boton-primario" onClick={onCerrado}>
                        Volver al partido
                    </button>
                </div>
            </section>
        );
    }

    return (
        <>
            <section
                className="panel captura-marcador"
                style={{ '--c': color } as CSSProperties}
            >
                <div className="cm-meta">
                    Set {numeroSet} · Rally {vivo.rally} · Toque {vivo.ordenEnRally}
                    {vivo.rotacion ? ` · Rotación R${vivo.rotacion}` : ''}
                </div>
                <div className="cm-cuerpo">
                    <div className="cm-lado">{nombreDe(miEquipoId)}</div>
                    <div className="cm-puntos">
                        <b>{vivo.puntosMios}</b>
                        <span className="cm-set">SET {numeroSet}</span>
                        <b>{vivo.puntosRival}</b>
                    </div>
                    <div className="cm-lado">{nombreDe(rivalId)}</div>
                </div>
                <div className="cm-controles">
                    <button
                        type="button"
                        className="boton"
                        disabled={vivo.enviando || vivo.log.length === 0}
                        onClick={vivo.deshacer}
                    >
                        Deshacer
                    </button>
                    <button
                        type="button"
                        className="boton"
                        disabled={vivo.enviando}
                        onClick={onCorregirAlineacion}
                    >
                        Corregir alineación
                    </button>
                    <button
                        type="button"
                        className="boton boton-peligro"
                        disabled={vivo.enviando}
                        onClick={cerrarSet}
                    >
                        Cerrar set
                    </button>
                </div>
                {vivo.error && <p className="error">{vivo.error}</p>}
            </section>

            <div className="captura-grid">
                <section className="panel">
                    <div className="sel-jugador">
                        <span className="sr-eti">1 · Jugador</span>
                        {enCancha.map((p) => (
                            <button
                                key={p.jugadorId}
                                type="button"
                                className={`chip-jug ${jugadorSel === p.jugadorId ? 'activo' : ''}`}
                                disabled={jugadorSel !== null || vivo.enviando}
                                title={p.zona ? `Zona ${p.zona}` : 'Líbero'}
                                onClick={() => setJugadorSel(p.jugadorId)}
                            >
                                {fichaDe(p.jugadorId)?.numero ?? '?'} · {nombreJugador(p.jugadorId)}
                                {p.zona ? ` (Z${p.zona})` : ' (L)'}
                            </button>
                        ))}
                        {jugadorSel && (
                            <button
                                type="button"
                                className="boton boton-mini"
                                onClick={() => setJugadorSel(null)}
                            >
                                Cambiar
                            </button>
                        )}
                    </div>

                    <span className="sr-eti">2 · Acción</span>
                    {GRUPOS.map((g) => (
                        <div key={g.titulo} className="grupo-acciones">
                            <span className="ga-titulo">{g.titulo}</span>
                            <div className="ga-botones">
                                {g.botones.map((b) => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        className={`boton-accion ${b.tono}`}
                                        disabled={jugadorSel === null || vivo.enviando}
                                        onClick={() => elegirAccion(b)}
                                    >
                                        {b.eti}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                <section className="panel">
                    <h3>Bitácora</h3>
                    {vivo.log.length === 0 ? (
                        <p className="cm-meta">Todavía no hay jugadas registradas.</p>
                    ) : (
                        <div className="log-acciones">
                            {[...vivo.log].reverse().slice(0, 20).map((a) => {
                                const boton = botonDe(a.tipo, a.resultado);
                                return (
                                    <div key={a.id} className={`log-item ${boton?.tono ?? ''}`}>
                                        R{a.rotacion} · #{fichaDe(a.jugadorId)?.numero ?? '?'}{' '}
                                        {nombreJugador(a.jugadorId)} — {boton?.eti ?? a.resultado}
                                        {a.puntoParaEquipoId === miEquipoId && ' · punto'}
                                        {a.puntoParaEquipoId === rivalId && ' · punto rival'}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
