type TarjetaTorneoProps = {
    nombre: string;
    temporada: number;
    categoria: 'femenino' | 'masculino';
};

export function TarjetaTorneo({ nombre, temporada, categoria }: TarjetaTorneoProps) {
    return (
        <>
            <h3>{nombre}</h3>
            <div className="te-meta">Temporada {temporada} · {categoria}</div>
        </>
    );
}