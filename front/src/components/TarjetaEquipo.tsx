type TarjetaEquipoProps = {
    nombre: string;
    provincia: string | null;
    categoria: 'femenino' | 'masculino';
};

export function TarjetaEquipo({ nombre, provincia, categoria }: TarjetaEquipoProps) {
    return (
        <>
            <h3>{nombre}</h3>
            <div className='te-meta'>{provincia ? `${provincia} · ${categoria}` : categoria}</div>
        </>
    );
}