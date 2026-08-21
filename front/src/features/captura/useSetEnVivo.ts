import { useState, useEffect } from 'react';
import {
    accionesDeSet,
    cancha,
    registrarAccion,
    deshacer as deshacerAccion,
    cerrarSet,
    type Accion,
    type PosicionEnCancha,
} from '../../api/captura';
import type { BotonAccion } from './acciones';

// Espeja accionesVigentes del dominio: un "deshacer" anexa una fila que
// señala a la acción anulada, así que quedan fuera las dos.
function vigentes(acciones: Accion[]): Accion[] {
    const anuladas = new Set(acciones.filter((a) => a.corrigeAccionId).map((a) => a.corrigeAccionId));
    return acciones.filter((a) => !a.corrigeAccionId && !anuladas.has(a.id));
}

// El set en vivo. Guarda la lista cruda de acciones y de ahí DERIVA todo
// lo que se ve: el marcador, en qué rally va y qué toque toca. Es el
// mismo trato que hace el backend, y por eso deshacer no necesita más
// que quitar una acción de la cuenta.
export function useSetEnVivo(
    setId: string,
    miEquipoId: string,
    rivalId: string,
    soyLocal: boolean,
) {
    const [acciones, setAcciones] = useState<Accion[]>([]);
    const [rotacion, setRotacion] = useState<number | null>(null);
    const [enCancha, setEnCancha] = useState<PosicionEnCancha[]>([]);
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [cerrado, setCerrado] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCargando(true);
        setError(null);
        (async () => {
            try {
                const [registradas, canchas] = await Promise.all([
                    accionesDeSet(setId),
                    cancha(setId),
                ]);
                setAcciones(registradas);
                aplicarCancha(canchas.find((c) => c.equipoId === miEquipoId));
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setCargando(false);
            }
        })();
    }, [setId, miEquipoId]);

    function aplicarCancha(mia: { rotacion: number; jugadores: PosicionEnCancha[] } | undefined) {
        setRotacion(mia?.rotacion ?? null);
        setEnCancha(mia?.jugadores ?? []);
    }

    async function refrescarCancha() {
        const canchas = await cancha(setId);
        aplicarCancha(canchas.find((c) => c.equipoId === miEquipoId));
    }

    const log = vigentes(acciones);
    const puntosMios = log.filter((a) => a.puntoParaEquipoId === miEquipoId).length;
    const puntosRival = log.filter((a) => a.puntoParaEquipoId === rivalId).length;

    // El rally sale de la última acción vigente: si cerró el rally,
    // arranca el siguiente; si no, seguimos en el mismo.
    const ultima = log.at(-1);
    const rally = ultima ? (ultima.puntoParaEquipoId ? ultima.rally + 1 : ultima.rally) : 1;

    // El lugar dentro del rally NO se recicla. La base reserva
    // (set, rally, orden) para toda acción que no sea una anulación, y
    // una acción deshecha sigue ahí ocupando el suyo: si repitiéramos el
    // número, el siguiente registro chocaría. Se toma entonces el último
    // lugar ocupado del rally, no el último vigente.
    const ocupados = acciones.filter((a) => !a.corrigeAccionId && a.rally === rally);
    const ordenEnRally = ocupados.length
        ? Math.max(...ocupados.map((a) => a.ordenEnRally)) + 1
        : 1;

    async function registrar(jugadorId: string, boton: BotonAccion) {
        setEnviando(true);
        setError(null);
        try {
            const punto =
                boton.punto === 'mio' ? miEquipoId : boton.punto === 'rival' ? rivalId : null;
            const creada = await registrarAccion(setId, {
                equipoId: miEquipoId,
                jugadorId,
                rally,
                ordenEnRally,
                tipo: boton.tipo,
                resultado: boton.resultado,
                puntoParaEquipoId: punto,
            });
            setAcciones((prev) => [...prev, creada]);
            // La cancha solo gira cuando el rally se cierra: pedirla nada
            // más ahí ahorra una vuelta al servidor por cada toque.
            if (punto) await refrescarCancha();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setEnviando(false);
        }
    }

    async function deshacer() {
        setEnviando(true);
        setError(null);
        try {
            const anulacion = await deshacerAccion(setId);
            setAcciones((prev) => [...prev, anulacion]);
            await refrescarCancha();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setEnviando(false);
        }
    }

    // Al cerrar, el marcador se manda como lo entiende el partido
    // (casa/visita), no como lo vive el capturador (mío/rival).
    async function cerrar() {
        setEnviando(true);
        setError(null);
        try {
            await cerrarSet(
                setId,
                soyLocal ? puntosMios : puntosRival,
                soyLocal ? puntosRival : puntosMios,
            );
            setCerrado(true);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setEnviando(false);
        }
    }

    return {
        log,
        puntosMios,
        puntosRival,
        rally,
        ordenEnRally,
        rotacion,
        enCancha,
        cargando,
        enviando,
        cerrado,
        error,
        registrar,
        deshacer,
        cerrar,
    };
}
