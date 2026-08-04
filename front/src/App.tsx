import { Routes, Route, Link } from 'react-router'

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Inicio</Link> · <Link to="/equipos">Equipos</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h1> Volleyball Costa Rica</h1>} />
      </Routes>
    </div>
  );
}

export default App;