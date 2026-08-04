type TarjetaEquipoProps = {
    nombre: string;
    corto: string;
    categoria: 'femenino' | 'masculino';
};

export function TarjetaEquipo({ nombre, corto, categoria }: TarjetaEquipoProps) {
    return (
        <article className="tarjeta-equipo">
            <span className="corto">{corto}</span>
            <div>
                <h3>{nombre}</h3>
                <p>{categoria}</p>
            </div>
        </article>
    );
}