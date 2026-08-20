import { Routes, Route, NavLink } from 'react-router'
import { PaginaEquipos } from './features/equipos/PaginaEquipos'
import { PaginaEquipo } from './features/equipos/PaginaEquipo'
import { PaginaTorneos } from './features/torneos/PaginaTorneos'
import { PaginaTorneo } from './features/torneos/PaginaTorneo'

function App() {
  const claseNav = ({ isActive }: { isActive: boolean }) => (isActive ? 'activo' : '');

  return (
    <>
      <header className="cabecera">
        <span>
          VolleyTool <span className="badge-cr">CR</span>
        </span>
        <nav className="principal">
          <NavLink to="/" end className={claseNav}>Inicio</NavLink>
          <NavLink to="/equipos" className={claseNav}>Equipos</NavLink>
          <NavLink to="/torneos" className={claseNav}>Torneos</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<h1> Volleyball Costa Rica</h1>} />
        <Route path="/equipos" element={<PaginaEquipos />} />
        <Route path="/equipos/:id" element={<PaginaEquipo />} />
        <Route path="/torneos" element={<PaginaTorneos />} />
        <Route path="/torneos/:id" element={<PaginaTorneo />} />
      </Routes>
    </>
  );
}

export default App;