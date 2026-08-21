import type { TipoAccion, ResultadoAccion } from '../../api/captura';

// El catálogo de botones de la planilla. Cada botón es un par
// (tipo, resultado) de los que admite el dominio, más lo que ese par
// significa para el rally: `punto` dice si la jugada lo cerró y para
// quién. De ahí salen solos el marcador y la rotación, que el backend
// deduce de la seguidilla de puntos.
export type BotonAccion = {
    id: string;
    eti: string;
    tipo: TipoAccion;
    resultado: ResultadoAccion;
    punto: 'mio' | 'rival' | null;
    tono: 'ok' | 'neutro' | 'mal';
};

export type GrupoAcciones = {
    titulo: string;
    botones: BotonAccion[];
};

// Capturamos un solo equipo, así que los puntos del rival entran como el
// error nuestro que se los regaló: su ace es nuestro error de recepción,
// su remate es nuestro error de defensa, su bloqueo es nuestro error de
// ataque. Es la convención de cualquier planilla técnica.
export const GRUPOS: GrupoAcciones[] = [
    {
        titulo: 'Saque',
        botones: [
            { id: 'ace', eti: 'Ace', tipo: 'saque', resultado: 'ace', punto: 'mio', tono: 'ok' },
            { id: 'saque-ok', eti: 'Saque recibido', tipo: 'saque', resultado: 'recibido', punto: null, tono: 'neutro' },
            { id: 'saque-err', eti: 'Saque errado', tipo: 'saque', resultado: 'error', punto: 'rival', tono: 'mal' },
        ],
    },
    {
        titulo: 'Recepción',
        botones: [
            { id: 'rec-perf', eti: 'Recepción perfecta', tipo: 'recepcion', resultado: 'perfecta', punto: null, tono: 'ok' },
            { id: 'rec-fs', eti: 'Fuera de sistema', tipo: 'recepcion', resultado: 'fuera_sistema', punto: null, tono: 'neutro' },
            { id: 'rec-err', eti: 'Ace en contra', tipo: 'recepcion', resultado: 'error', punto: 'rival', tono: 'mal' },
        ],
    },
    {
        titulo: 'Colocación',
        botones: [
            { id: 'col-ok', eti: 'Colocación buena', tipo: 'colocacion', resultado: 'ok', punto: null, tono: 'neutro' },
            { id: 'col-err', eti: 'Error de colocación', tipo: 'colocacion', resultado: 'error', punto: 'rival', tono: 'mal' },
        ],
    },
    {
        titulo: 'Ataque',
        botones: [
            { id: 'atq-pt', eti: 'Punto de ataque', tipo: 'ataque', resultado: 'punto_directo', punto: 'mio', tono: 'ok' },
            { id: 'atq-def', eti: 'Ataque defendido', tipo: 'ataque', resultado: 'defendido', punto: null, tono: 'neutro' },
            { id: 'atq-err', eti: 'Error de ataque', tipo: 'ataque', resultado: 'error', punto: 'rival', tono: 'mal' },
        ],
    },
    {
        titulo: 'Bloqueo',
        botones: [
            { id: 'blq-pt', eti: 'Bloqueo punto', tipo: 'bloqueo', resultado: 'punto_directo', punto: 'mio', tono: 'ok' },
            { id: 'blq-def', eti: 'Bloqueo tocado', tipo: 'bloqueo', resultado: 'defendido', punto: null, tono: 'neutro' },
            { id: 'blq-err', eti: 'Error de bloqueo', tipo: 'bloqueo', resultado: 'error', punto: 'rival', tono: 'mal' },
        ],
    },
    {
        titulo: 'Defensa',
        botones: [
            { id: 'def-ok', eti: 'Defensa exitosa', tipo: 'defensa', resultado: 'exitosa', punto: null, tono: 'ok' },
            { id: 'def-err', eti: 'Punto del rival', tipo: 'defensa', resultado: 'error', punto: 'rival', tono: 'mal' },
        ],
    },
];

const PORPAR = new Map(GRUPOS.flatMap((g) => g.botones).map((b) => [`${b.tipo}:${b.resultado}`, b]));

// El camino de vuelta: de la acción guardada al botón que la generó, para
// que la bitácora se lea igual que la planilla.
export function botonDe(tipo: TipoAccion, resultado: ResultadoAccion): BotonAccion | undefined {
    return PORPAR.get(`${tipo}:${resultado}`);
}
