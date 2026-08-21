import { useState, useEffect } from 'react';
import { alineacionDeSet, declararAlineacion, type JugadorAlineado } from '../../api/captura';
import { usePlantilla } from './usePlantilla';

// La cancha se dibuja como se ve desde la banca: la red arriba, con los
// delanteros (4-3-2) al frente y los zagueros (5-6-1) atrás.
const FILAS = [
    [4, 3, 2],
    [5, 6, 1],
];

type Props = {
    setId: string;
    miEquipoId: string;
    torneoId: string;
    onListo: () => void;
};

// Paso 2: los 6 titulares con su zona de arranque y, sobre todo, DÓNDE
// arranca el armador. Esa zona es la que ancla la numeración de las
// rotaciones: "rotación 3" querrá decir "armador en zona 3" en todos los
// sets, y por eso el capturador no vuelve a tocar la rotación en vivo.
export function DeclararAlineacion({ setId, miEquipoId, torneoId, onListo }: Props) {
    const { jugadores, cargando, error } = usePlantilla(miEquipoId, torneoId);
    const [porZona, setPorZona] = useState<Record<number, string>>({});
    const [armador, setArmador] = useState<string | null>(null);
    const [libero, setLibero] = useState<string>('');
    const [guardando, setGuardando] = useState(false);
    const [fallo, setFallo] = useState<string | null>(null);

    // Si el set ya traía alineación (se está corrigiendo o retomando), se
    // precarga para no volver a escribirla entera.
    useEffect(() => {
        alineacionDeSet(setId)
            .then((filas) => {
                const mias = filas.filter((a) => a.equipoId === miEquipoId && a.saleEnRally == null);
                const zonas: Record<number, string> = {};
                for (const a of mias) {
                    if (a.posicionInicial != null) zonas[a.posicionInicial] = a.jugadorId;
                }
                setPorZona(zonas);
                setArmador(mias.find((a) => a.esArmador)?.jugadorId ?? null);
                setLibero(mias.find((a) => a.esLibero)?.jugadorId ?? '');
            })
            .catch(() => {
                // Sin alineación previa: se declara desde cero.
            });
    }, [setId, miEquipoId]);

    if (cargando) return <section className="panel"><p>Cargando la plantilla...</p></section>;
    if (error) return <section className="panel"><p>Error: {error}</p></section>;

    if (jugadores.length === 0) {
        return (
            <section className="panel">
                <h2>Alineación</h2>
                <p>Este equipo no tiene jugadores inscritos todavía; sin plantilla no hay a quién alinear.</p>
            </section>
        );
    }

    const titulares = Object.values(porZona).filter(Boolean);
    const completa = FILAS.flat().every((z) => porZona[z]);
    const listo = completa && armador !== null && titulares.includes(armador);

    function ponerEnZona(zona: number, jugadorId: string) {
        setPorZona((prev) => {
            const siguiente = { ...prev };
            if (jugadorId) siguiente[zona] = jugadorId;
            else delete siguiente[zona];
            return siguiente;
        });
        // Si el armador salía de esa zona, la marca se va con él.
        if (armador && porZona[zona] === armador) setArmador(jugadorId || null);
    }

    async function guardar() {
        setGuardando(true);
        setFallo(null);
        try {
            const alineados: JugadorAlineado[] = FILAS.flat().map((zona) => ({
                jugadorId: porZona[zona],
                posicionInicial: zona,
                esArmador: porZona[zona] === armador,
            }));
            if (libero) {
                alineados.push({ jugadorId: libero, posicionInicial: null, esLibero: true });
            }
            await declararAlineacion(setId, miEquipoId, alineados);
            onListo();
        } catch (e) {
            setFallo((e as Error).message);
        } finally {
            setGuardando(false);
        }
    }

    // Un jugador no puede estar en dos lugares a la vez: cada select solo
    // ofrece a los que están libres (más el suyo), y nunca al líbero, que
    // no entra en el giro.
    const disponibles = (zona: number) =>
        jugadores.filter(
            (j) =>
                j.jugadorId === porZona[zona] ||
                (!titulares.includes(j.jugadorId) && j.jugadorId !== libero),
        );

    return (
        <section className="panel">
            <h2>3 · Alineación de arranque</h2>
            <p className="cm-meta">
                Poné a los 6 titulares en su zona y marcá con ★ dónde arranca el armador. Esa zona
                es la que numera las rotaciones del set.
            </p>

            <div className="red-cancha">Red</div>
            {FILAS.map((fila, i) => (
                <div key={i} className="cancha-zonas">
                    {fila.map((zona) => (
                        <div
                            key={zona}
                            className={`zona ${porZona[zona] && porZona[zona] === armador ? 'armador' : ''}`}
                        >
                            <span className="zona-eti">
                                Zona {zona}
                                <button
                                    type="button"
                                    className={`marca-armador ${porZona[zona] === armador ? 'activo' : ''}`}
                                    disabled={!porZona[zona]}
                                    title="Marcar como armador"
                                    onClick={() => setArmador(porZona[zona])}
                                >
                                    ★
                                </button>
                            </span>
                            <select
                                value={porZona[zona] ?? ''}
                                onChange={(e) => ponerEnZona(zona, e.target.value)}
                            >
                                <option value="">— vacío —</option>
                                {disponibles(zona).map((j) => (
                                    <option key={j.jugadorId} value={j.jugadorId}>
                                        {j.numero} · {j.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            ))}

            <label className="campo">
                <span>Líbero (opcional)</span>
                <select value={libero} onChange={(e) => setLibero(e.target.value)}>
                    <option value="">— sin líbero —</option>
                    {jugadores
                        .filter((j) => !titulares.includes(j.jugadorId))
                        .map((j) => (
                            <option key={j.jugadorId} value={j.jugadorId}>
                                {j.numero} · {j.nombre}
                            </option>
                        ))}
                </select>
            </label>

            {fallo && <p className="error">{fallo}</p>}

            <div className="cm-controles">
                <button
                    type="button"
                    className="boton boton-primario"
                    disabled={!listo || guardando}
                    onClick={guardar}
                >
                    {guardando ? 'Guardando...' : 'Empezar a capturar'}
                </button>
            </div>
            {!listo && (
                <p className="cm-meta">
                    {completa ? 'Falta marcar al armador.' : 'Faltan titulares por ubicar.'}
                </p>
            )}
        </section>
    );
}
