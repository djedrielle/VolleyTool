import { Routes, Route, NavLink } from 'react-router'
import { PaginaEquipos } from './features/equipos/PaginaEquipos'
import { PaginaEquipo } from './features/equipos/PaginaEquipo'
import { PaginaHistorico } from './features/equipos/PaginaHistorico'
import { PaginaTorneos } from './features/torneos/PaginaTorneos'
import { PaginaTorneo } from './features/torneos/PaginaTorneo'
import { PaginaLogin } from './features/auth/PaginaLogin'
import { useAuth } from './features/auth/AuthContext'

function App() {
  const { usuario, logout } = useAuth();
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
          {usuario ? (
            <button type="button" onClick={logout}>Salir ({usuario.email})</button>
          ) : (
            <NavLink to="/login" className={claseNav}>Entrar</NavLink>
          )}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<h1> Volleyball Costa Rica</h1>} />
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/equipos" element={<PaginaEquipos />} />
        <Route path="/equipos/:id" element={<PaginaEquipo />} />
        <Route path="/equipos/:id/historico" element={<PaginaHistorico />} />
        <Route path="/torneos" element={<PaginaTorneos />} />
        <Route path="/torneos/:id" element={<PaginaTorneo />} />
      </Routes>
    </>
  );
}

export default App;