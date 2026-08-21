import { Routes, Route, NavLink } from 'react-router'
import { PaginaEquipos } from './features/equipos/PaginaEquipos'
import { PaginaEquipo } from './features/equipos/PaginaEquipo'
import { PaginaHistorico } from './features/equipos/PaginaHistorico'
import { PaginaTorneos } from './features/torneos/PaginaTorneos'
import { PaginaTorneo } from './features/torneos/PaginaTorneo'
import { PaginaLogin } from './features/auth/PaginaLogin'
import { PaginaCaptura } from './features/captura/PaginaCaptura'
import { PaginaCapturaPartido } from './features/captura/PaginaCapturaPartido'
import { RutaProtegida } from './components/RutaProtegida'
import { useAuth } from './features/auth/AuthContext'
import type { Rol } from './api/auth'

const ROLES_CAPTURA: Rol[] = ['capturador', 'administrador'];

function App() {
  const { usuario, logout } = useAuth();
  const claseNav = ({ isActive }: { isActive: boolean }) => (isActive ? 'activo' : '');
  const puedeCapturar = usuario !== null && ROLES_CAPTURA.includes(usuario.rol);

  return (
    <>
      <header className="cabecera">
        <span className="marca">
          VolleyTool <span className="badge-cr">CR</span>
        </span>
        <nav className="principal">
          <NavLink to="/" end className={claseNav}>Inicio</NavLink>
          <NavLink to="/equipos" className={claseNav}>Equipos</NavLink>
          <NavLink to="/torneos" className={claseNav}>Torneos</NavLink>
          {puedeCapturar && <NavLink to="/captura" className={claseNav}>Capturar</NavLink>}
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
        <Route
          path="/captura"
          element={
            <RutaProtegida roles={ROLES_CAPTURA}>
              <PaginaCaptura />
            </RutaProtegida>
          }
        />
        <Route
          path="/captura/:partidoId"
          element={
            <RutaProtegida roles={ROLES_CAPTURA}>
              <PaginaCapturaPartido />
            </RutaProtegida>
          }
        />
      </Routes>
    </>
  );
}

export default App;
