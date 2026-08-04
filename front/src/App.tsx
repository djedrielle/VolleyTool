import { Routes, Route, Link } from 'react-router'
import { PaginaEquipos } from './features/equipos/PaginaEquipos'
import { PaginaEquipo } from './features/equipos/PaginaEquipo'

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Inicio</Link> · <Link to="/equipos">Equipos</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h1> Volleyball Costa Rica</h1>} />
        <Route path="/equipos" element={<PaginaEquipos />} />
        <Route path="/equipos/:id" element={<PaginaEquipo />} />
      </Routes>
    </div>
  );
}

export default App;