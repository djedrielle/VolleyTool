import { Link } from 'react-router';
import type { FilaClasificacion } from '../api/clasificacion';

type Props = {
    filas: FilaClasificacion[];
    nombreDe: (equipoId: string) => string;
    equipoResaltado?: string;
};

export function TablaPosiciones({ filas, nombreDe, equipoResaltado }: Props) {
    return (
        <div className="tabla-envoltura">
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th className="izq">Equipo</th>
                        <th>PJ</th><th>PG</th><th>PP</th><th>Sets</th><th>Puntos</th>
                    </tr>
                </thead>
                <tbody>

                    {filas.map((f, i) => {
                        const clase = f.equipoId === equipoResaltado ? 'fila-activa' : i === 0 ? 'lider' : '';
                        return (
                            <tr key={f.equipoId} className={clase}>
                                <td>{i + 1}</td>
                                <td className="izq">
                                    <Link className="link-equipo" to={`/equipos/${f.equipoId}`}>{nombreDe(f.equipoId)}</Link>
                                </td>
                                <td>{f.pj}</td>
                                <td>{f.pg}</td>
                                <td>{f.pp}</td>
                                <td>{f.setsFavor}–{f.setsContra}</td>
                                <td><b>{f.puntos}</b></td>
                            </tr>
                        );
                    })}

                </tbody>
            </table>
        </div>
    );
}