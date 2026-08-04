import { useState, useEffect } from 'react';
import { TarjetaEquipo } from './components/TarjetaEquipo';
import { listarEquipos, type Equipo } from './api/equipos';

function App() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarEquipos()
      .then((datos) => setEquipos(datos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <main>
      <h1>Volleyball Costa Rica</h1>
      <section className="listar-equipos">
        {equipos.map((equipo) => (
          <TarjetaEquipo key={equipo.id} nombre={equipo.nombre} corto={equipo.corto} categoria={equipo.categoria} />
        ))}
      </section>
    </main>
  )

}

export default App;