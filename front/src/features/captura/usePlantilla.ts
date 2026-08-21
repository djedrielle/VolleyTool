import { useState, useEffect } from 'react';
import { listarPlantillas } from '../../api/plantillas';
import { listarJugadores } from '../../api/jugadores';
import type { Posicion } from '../../api/plantillas';

// El jugador tal como lo necesita la planilla: quién es, con qué número
// juega y en qué posición está inscrito.
export type JugadorPlantilla = {
    jugadorId: string;
    nombre: string;
    numero: number;
    posicion: Posicion;
};

// La plantilla de un equipo en un torneo. El backend todavía no filtra
// por equipo/torneo, así que el cruce se hace acá: se traen las
// inscripciones y las fichas, y se juntan por jugadorId.
export function usePlantilla(equipoId: string, torneoId: string) {
    const [jugadores, setJugadores] = useState<JugadorPlantilla[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCargando(true);
        setError(null);
        (async () => {
            try {
                const [plantillas, fichas] = await Promise.all([
                    listarPlantillas(),
                    listarJugadores(),
                ]);
                const delEquipo = plantillas.filter((p) => p.equipoId === equipoId);
                // Lo normal es la inscripción en ESTE torneo; si el equipo
                // todavía no está inscrito, se cae a la que tenga.
                const delTorneo = delEquipo.filter((p) => p.torneoId === torneoId);
                const inscripciones = delTorneo.length ? delTorneo : delEquipo;

                const nombreDe = (id: string) => {
                    const f = fichas.find((j) => j.id === id);
                    return f ? `${f.nombre} ${f.apellido1}` : id;
                };

                setJugadores(
                    inscripciones
                        .map((p) => ({
                            jugadorId: p.jugadorId,
                            nombre: nombreDe(p.jugadorId),
                            numero: p.numero,
                            posicion: p.posicion,
                        }))
                        .sort((a, b) => a.numero - b.numero),
                );
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setCargando(false);
            }
        })();
    }, [equipoId, torneoId]);

    return { jugadores, cargando, error };
}
