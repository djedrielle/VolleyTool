/* ============================================================
   VolleyTool CR — Datos de demostración
   ------------------------------------------------------------
   Todos los equipos, jugadores, partidos y estadísticas son
   FICTICIOS. Se generan de forma determinista (misma semilla)
   para que la demo se vea idéntica en cada carga.
   ============================================================ */

'use strict';

/* ---------- Generador aleatorio determinista (mulberry32) ---------- */
function crearRNG(semilla) {
  let s = semilla >>> 0;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const _rng = crearRNG(20260612);
const azar = (min, max) => Math.floor(_rng() * (max - min + 1)) + min;
const elegir = (arr) => arr[Math.floor(_rng() * arr.length)];

/* ============================ EQUIPOS ============================ */

const EQUIPOS = [
  { id: 'volcanes', nombre: 'Volcanes de Heredia',    corto: 'VOL', provincia: 'Heredia',    sede: 'Palacio de los Deportes, Heredia',      categoria: 'Femenino',  color: '#ef4456', fundado: 2013, entrenador: 'Marcela Víquez',  fuerza: 88 },
  { id: 'ticas',    nombre: 'Ticas de San José',      corto: 'TSJ', provincia: 'San José',   sede: 'Gimnasio Nacional, La Sabana',          categoria: 'Femenino',  color: '#3b82f6', fundado: 2010, entrenador: 'Luis Cordero',    fuerza: 84 },
  { id: 'brumosas', nombre: 'Brumosas de Cartago',    corto: 'BRU', provincia: 'Cartago',    sede: 'Polideportivo de Cartago',              categoria: 'Femenino',  color: '#a78bfa', fundado: 2016, entrenador: 'Gabriela Solís',  fuerza: 80 },
  { id: 'pampa',    nombre: 'Pampa de Guanacaste',    corto: 'PAM', provincia: 'Guanacaste', sede: 'Gimnasio Municipal de Liberia',         categoria: 'Femenino',  color: '#f5b942', fundado: 2018, entrenador: 'Karla Esquivel',  fuerza: 75 },
  { id: 'caribe',   nombre: 'Caribe de Limón',        corto: 'CAR', provincia: 'Limón',      sede: 'Gimnasio Eddy Bermúdez, Limón',         categoria: 'Masculino', color: '#34d399', fundado: 2012, entrenador: 'Mainor Vargas',   fuerza: 86 },
  { id: 'olas',     nombre: 'Olas de Puntarenas',     corto: 'OLA', provincia: 'Puntarenas', sede: 'Gimnasio Municipal de El Roble',        categoria: 'Masculino', color: '#22d3ee', fundado: 2015, entrenador: 'Allan Jiménez',   fuerza: 82 },
  { id: 'erizos',   nombre: 'Erizos de Alajuela',     corto: 'ERI', provincia: 'Alajuela',   sede: 'Polideportivo Monserrat, Alajuela',     categoria: 'Masculino', color: '#fb923c', fundado: 2011, entrenador: 'Priscilla Umaña', fuerza: 78 },
  { id: 'cima',     nombre: 'Cima de Pérez Zeledón',  corto: 'CIM', provincia: 'San José',   sede: 'Gimnasio Municipal de San Isidro',      categoria: 'Masculino', color: '#a3e635', fundado: 2019, entrenador: 'Rándall Mena',    fuerza: 72 },
];

/* ============================ JUGADORES ============================ */

const NOMBRES_F = ['María José', 'Daniela', 'Valeria', 'Sofía', 'Camila', 'Fernanda', 'Gabriela', 'Mariana', 'Natalia', 'Andrea', 'Pamela', 'Kimberly', 'Yerlin', 'Hazel', 'Nicole', 'Melissa', 'Tatiana', 'Krisia', 'Dayana', 'Paola', 'Yuliana', 'Raquel', 'Stephanie', 'Karina', 'Ivannia', 'Alejandra', 'Mónica', 'Priscila', 'Wendy', 'Laura', 'Carolina', 'Jimena'];
const NOMBRES_M = ['José Pablo', 'Daniel', 'Andrés', 'Luis Diego', 'Carlos', 'Esteban', 'Kevin', 'Jorge', 'Marco', 'Allan', 'Greivin', 'Randall', 'Bryan', 'Josué', 'Fabián', 'Mauricio', 'Diego', 'Sebastián', 'Gerald', 'Cristian', 'Keylor', 'Alonso', 'Johan', 'Óscar', 'Adrián', 'Felipe', 'Ignacio', 'Mario', 'Pablo', 'Ronald', 'Steven', 'Yeudy'];
const APELLIDOS = ['Rodríguez', 'Jiménez', 'Vargas', 'Mora', 'Solano', 'Brenes', 'Araya', 'Castro', 'Chaves', 'Ramírez', 'Quesada', 'Salas', 'Campos', 'Villalobos', 'Monge', 'Alfaro', 'Calderón', 'Cordero', 'Herrera', 'Picado', 'Ulate', 'Zúñiga', 'Sibaja', 'Bolaños', 'Soto', 'Madrigal', 'Barboza', 'Carvajal', 'Murillo', 'Espinoza', 'Acuña', 'Fonseca', 'Granados', 'León', 'Núñez'];
const TIPOS_SANGRE = ['O+', 'O+', 'O+', 'A+', 'A+', 'B+', 'O-', 'A-', 'AB+'];

const CODIGO_PROVINCIA = { 'San José': 1, 'Alajuela': 2, 'Cartago': 3, 'Heredia': 4, 'Guanacaste': 5, 'Puntarenas': 6, 'Limón': 7 };

// Rangos físicos por posición: [alturaMinF, alturaMaxF, alturaMinM, alturaMaxM, saltoBaseF, saltoBaseM]
const FISICO_POR_POSICION = {
  'Armador(a)': [165, 178, 178, 190, 40, 55],
  'Opuesto(a)': [174, 186, 188, 200, 46, 62],
  'Central':    [176, 188, 190, 204, 44, 60],
  'Punta':      [170, 184, 184, 198, 46, 62],
  'Líbero':     [158, 170, 168, 180, 38, 50],
};

const PLANTILLA_POSICIONES = ['Armador(a)', 'Armador(a)', 'Opuesto(a)', 'Opuesto(a)', 'Central', 'Central', 'Central', 'Punta', 'Punta', 'Punta', 'Punta', 'Líbero'];

function generarJugadores() {
  const nombresUsados = new Set();
  const jugadores = [];

  for (const eq of EQUIPOS) {
    const esFem = eq.categoria === 'Femenino';
    const pilaNombres = esFem ? NOMBRES_F : NOMBRES_M;

    // Números de camiseta únicos por equipo
    const numeros = [];
    while (numeros.length < PLANTILLA_POSICIONES.length) {
      const n = azar(1, 19);
      if (!numeros.includes(n)) numeros.push(n);
    }

    PLANTILLA_POSICIONES.forEach((posicion, i) => {
      // Nombre único en toda la liga
      let nombre, apellido1, apellido2, completo;
      do {
        nombre = elegir(pilaNombres);
        apellido1 = elegir(APELLIDOS);
        apellido2 = elegir(APELLIDOS);
        completo = `${nombre} ${apellido1} ${apellido2}`;
      } while (apellido1 === apellido2 || nombresUsados.has(completo));
      nombresUsados.add(completo);

      const [aMinF, aMaxF, aMinM, aMaxM, saltoF, saltoM] = FISICO_POR_POSICION[posicion];
      const altura = esFem ? azar(aMinF, aMaxF) : azar(aMinM, aMaxM);
      const imc = 20.5 + _rng() * 4;                       // 20.5 – 24.5
      const peso = Math.round(imc * (altura / 100) ** 2);
      const saltoBase = esFem ? saltoF : saltoM;
      const salto = saltoBase + azar(0, 14) + Math.round((eq.fuerza - 75) / 5);
      const alcanceParado = Math.round(altura * 1.31);
      const alcanceAtaque = alcanceParado + salto + azar(2, 6);
      const alcanceBloqueo = alcanceParado + Math.round(salto * 0.82);

      // Lateralidad: opuestos con mayor probabilidad de ser zurdos
      const pZurdo = posicion === 'Opuesto(a)' ? 0.35 : 0.15;
      const lateralidad = _rng() < pZurdo ? 'Zurdo(a)' : (_rng() < 0.05 ? 'Ambidiestro(a)' : 'Derecho(a)');

      const anioNac = azar(1997, 2007);
      const fechaNac = `${anioNac}-${String(azar(1, 12)).padStart(2, '0')}-${String(azar(1, 28)).padStart(2, '0')}`;
      const cedula = `${CODIGO_PROVINCIA[eq.provincia] || 1}-${azar(1000, 1899)}-0${azar(100, 999)}`;

      // ----- Estadísticas de temporada según posición -----
      const setsJugados = azar(14, 22);
      const bono = (eq.fuerza - 72) / 100;                 // los equipos fuertes rinden algo más
      let stats;
      if (posicion === 'Punta' || posicion === 'Opuesto(a)') {
        const ataques = azar(120, 240);
        const kills = Math.round(ataques * (0.36 + _rng() * 0.12 + bono * 0.3));
        stats = { ataques, kills, errAtaque: Math.round(ataques * (0.08 + _rng() * 0.07)), aces: azar(8, 26), errSaque: azar(8, 20), bloqueos: azar(6, 28), recepTotal: posicion === 'Punta' ? azar(90, 180) : azar(10, 40), asistencias: azar(5, 20), digs: azar(40, 110) };
      } else if (posicion === 'Central') {
        const ataques = azar(60, 130);
        const kills = Math.round(ataques * (0.45 + _rng() * 0.13 + bono * 0.3));
        stats = { ataques, kills, errAtaque: Math.round(ataques * (0.06 + _rng() * 0.06)), aces: azar(4, 16), errSaque: azar(6, 16), bloqueos: azar(24, 55), recepTotal: azar(0, 10), asistencias: azar(2, 8), digs: azar(15, 50) };
      } else if (posicion === 'Armador(a)') {
        const ataques = azar(15, 45);
        stats = { ataques, kills: Math.round(ataques * (0.4 + _rng() * 0.2)), errAtaque: azar(1, 6), aces: azar(6, 20), errSaque: azar(6, 16), bloqueos: azar(8, 24), recepTotal: azar(0, 8), asistencias: azar(320, 640), digs: azar(50, 120) };
      } else { // Líbero
        stats = { ataques: 0, kills: 0, errAtaque: 0, aces: 0, errSaque: 0, bloqueos: 0, recepTotal: azar(160, 300), asistencias: azar(10, 35), digs: azar(120, 260) };
      }
      stats.recepPerf = Math.round(stats.recepTotal * (0.28 + _rng() * 0.22 + bono * 0.2));
      stats.setsJugados = setsJugados;
      stats.puntos = stats.kills + stats.aces + stats.bloqueos;

      // ----- Radar de habilidades (0–100) -----
      const base = 48 + Math.round(bono * 60);
      const v = (extra) => Math.min(98, Math.max(25, base + extra + azar(-8, 10)));
      let radar;
      if (posicion === 'Punta')            radar = { Saque: v(8),  Ataque: v(18), Bloqueo: v(4),  'Recepción': v(14), Defensa: v(8) };
      else if (posicion === 'Opuesto(a)')  radar = { Saque: v(12), Ataque: v(22), Bloqueo: v(8),  'Recepción': v(-12), Defensa: v(0) };
      else if (posicion === 'Central')     radar = { Saque: v(2),  Ataque: v(12), Bloqueo: v(22), 'Recepción': v(-18), Defensa: v(-4) };
      else if (posicion === 'Armador(a)')  radar = { Saque: v(8),  Ataque: v(-10), Bloqueo: v(0), 'Recepción': v(-8), Defensa: v(12) };
      else                                 radar = { Saque: v(-20), Ataque: v(-25), Bloqueo: v(-25), 'Recepción': v(24), Defensa: v(24) };

      jugadores.push({
        id: `${eq.id}-${i + 1}`,
        equipoId: eq.id,
        nombre: completo,
        cedula, fechaNacimiento: fechaNac,
        tipoSangre: elegir(TIPOS_SANGRE),
        alturaCm: altura, pesoKg: peso, lateralidad, posicion,
        numero: numeros[i],
        capitan: false,
        nacionalidad: 'Costa Rica',
        fisico: {
          saltoVerticalCm: salto,
          alcanceAtaqueCm: alcanceAtaque,
          alcanceBloqueoCm: alcanceBloqueo,
          ultimaMedicion: '2026-05-28',
          fuente: 'Spike Performance',
        },
        stats, radar,
      });
    });

    // Capitán: el jugador de campo con más puntos
    const delEquipo = jugadores.filter(j => j.equipoId === eq.id && j.posicion !== 'Líbero');
    delEquipo.sort((a, b) => b.stats.puntos - a.stats.puntos)[0].capitan = true;
  }
  return jugadores;
}

const JUGADORES = generarJugadores();

/* ============================ PARTIDOS ============================ */

const TORNEO = 'Torneo Apertura 2026 · Primera División';

// Calendario doble round-robin para 4 equipos: [local, visita] por jornada
function rondasRoundRobin([a, b, c, d]) {
  return [
    [[a, b], [c, d]],
    [[a, c], [b, d]],
    [[a, d], [b, c]],
    [[b, a], [d, c]],
    [[c, a], [d, b]],
    [[d, a], [c, b]],
  ];
}

const FECHAS_FEM  = ['2026-04-18', '2026-04-25', '2026-05-09', '2026-05-16', '2026-05-30', '2026-06-12'];
const FECHAS_MASC = ['2026-04-19', '2026-04-26', '2026-05-10', '2026-05-17', '2026-05-31', '2026-06-14'];

function equipo(id) { return EQUIPOS.find(e => e.id === id); }

function simularSets(fuerzaL, fuerzaV) {
  const pLocal = (fuerzaL + 3) / (fuerzaL + 3 + fuerzaV);  // pequeña ventaja de localía
  const ganaLocal = _rng() < pLocal;
  const r = _rng();
  const setsPerdedor = r < 0.38 ? 0 : (r < 0.78 ? 1 : 2);
  const total = 3 + setsPerdedor;

  // En qué sets gana el perdedor (nunca el último)
  const setsDelPerdedor = [];
  while (setsDelPerdedor.length < setsPerdedor) {
    const s = azar(0, total - 2);
    if (!setsDelPerdedor.includes(s)) setsDelPerdedor.push(s);
  }

  const sets = [];
  for (let s = 0; s < total; s++) {
    const esTie = s === 4;
    const meta = esTie ? 15 : 25;
    const ganaSetGanador = !setsDelPerdedor.includes(s);
    let pts = azar(esTie ? 7 : 15, meta - 2);
    if (!esTie && _rng() < 0.18) pts = meta - 1 + azar(1, 3); // sets cerrados 26-24, 27-25…
    const ptsGanador = Math.max(meta, pts + 2);
    const marcador = ganaSetGanador
      ? (ganaLocal ? [ptsGanador, pts] : [pts, ptsGanador])
      : (ganaLocal ? [pts, ptsGanador] : [ptsGanador, pts]);
    sets.push(marcador);
  }
  return { sets, ganaLocal };
}

function statsDeEquipoEnPartido(puntosPropios, fuerza, gano) {
  const calidad = (fuerza - 70) / 100 + (gano ? 0.05 : 0);
  const kills = Math.round(puntosPropios * (0.50 + _rng() * 0.08));
  const ataques = Math.round(kills / (0.38 + _rng() * 0.10 + calidad * 0.2));
  const aces = Math.round(puntosPropios * (0.05 + _rng() * 0.05));
  const bloqueos = Math.round(puntosPropios * (0.07 + _rng() * 0.05));
  const saques = azar(68, 96);
  const errSaque = Math.round(saques * (0.07 + _rng() * 0.07));
  const errAtaque = Math.round(ataques * (0.07 + _rng() * 0.06));
  const recepTotal = azar(60, 88);
  const recepPerf = Math.round(recepTotal * (0.26 + _rng() * 0.20 + calidad * 0.25));

  // Distribución del ataque por rotación (R1–R6)
  const pesos = Array.from({ length: 6 }, () => 0.6 + _rng());
  const sumaPesos = pesos.reduce((x, y) => x + y, 0);
  let restanAtaques = ataques, restanKills = kills;
  const porRotacion = pesos.map((p, i) => {
    const esUltima = i === 5;
    const atq = esUltima ? restanAtaques : Math.round(ataques * p / sumaPesos);
    const efBase = kills / ataques + (_rng() - 0.5) * 0.22;
    const k = esUltima ? Math.max(0, restanKills) : Math.min(atq, Math.max(0, Math.round(atq * efBase)));
    restanAtaques -= atq; restanKills -= k;
    return { rot: i + 1, ataques: Math.max(0, atq), kills: k, puntos: k + azar(0, 4) };
  });

  return { saques, aces, errSaque, ataques, kills, errAtaque, bloqueos, recepTotal, recepPerf, porRotacion };
}

function generarPartidos() {
  const partidos = [];
  let n = 0;

  for (const categoria of ['Femenino', 'Masculino']) {
    const ids = EQUIPOS.filter(e => e.categoria === categoria).map(e => e.id);
    const rondas = rondasRoundRobin(ids);
    const fechas = categoria === 'Femenino' ? FECHAS_FEM : FECHAS_MASC;

    rondas.forEach((jornada, j) => {
      jornada.forEach(([localId, visitaId], k) => {
        n++;
        const fecha = `${fechas[j]}T${k === 0 ? '17:00' : '19:30'}`;
        const id = `p${n}`;
        const eL = equipo(localId), eV = equipo(visitaId);

        // Jornada 6: partidos de hoy/futuro → en vivo o programados
        const esFutura = j === 5;
        if (esFutura) {
          const enVivo = categoria === 'Femenino' && k === 1; // el de las 7:30 pm de hoy
          partidos.push({
            id, torneo: TORNEO, categoria, jornada: j + 1, fecha,
            local: localId, visita: visitaId, sede: eL.sede,
            estado: enVivo ? 'envivo' : 'programado',
            envivo: enVivo ? { set: 3, marcadorSets: [1, 1], puntos: [18, 16], espectadores: 1243 } : null,
          });
          return;
        }

        const { sets, ganaLocal } = simularSets(eL.fuerza, eV.fuerza);
        const ptsL = sets.reduce((s, m) => s + m[0], 0);
        const ptsV = sets.reduce((s, m) => s + m[1], 0);
        const stats = {
          [localId]: statsDeEquipoEnPartido(ptsL, eL.fuerza, ganaLocal),
          [visitaId]: statsDeEquipoEnPartido(ptsV, eV.fuerza, !ganaLocal),
        };
        const idGanador = ganaLocal ? localId : visitaId;
        const candidatosMVP = JUGADORES.filter(x => x.equipoId === idGanador && x.posicion !== 'Líbero')
          .sort((a, b) => b.stats.puntos - a.stats.puntos);
        const mvp = candidatosMVP[azar(0, 1)].id;

        partidos.push({
          id, torneo: TORNEO, categoria, jornada: j + 1, fecha,
          local: localId, visita: visitaId, sede: eL.sede,
          estado: 'finalizado', sets, ganador: idGanador, stats, mvp,
          video: {
            duracion: `${azar(1, 2)}:${String(azar(10, 59))}:${String(azar(10, 59))}`,
            vistas: azar(120, 1900),
          },
        });
      });
    });
  }
  return partidos;
}

const PARTIDOS = generarPartidos();

/* ============================ VIDEOS EXTRA ============================ */

const VIDEOS_EXTRA = [
  { id: 'vx1', titulo: 'Top 10 puntos · Jornada 5 del Apertura', tipo: 'Resumen',     duracion: '08:42', vistas: 3120, fecha: '2026-06-02' },
  { id: 'vx2', titulo: 'Clínica: lectura de bloqueo con Mainor Vargas', tipo: 'Formación', duracion: '24:15', vistas: 1480, fecha: '2026-05-21' },
  { id: 'vx3', titulo: 'Entrevista: Marcela Víquez y el proyecto de Volcanes', tipo: 'Entrevista', duracion: '15:03', vistas: 2210, fecha: '2026-05-18' },
  { id: 'vx4', titulo: 'Así se vivió la fecha inaugural en La Sabana', tipo: 'Resumen', duracion: '06:51', vistas: 4054, fecha: '2026-04-20' },
];

/* ============================ NOTICIAS Y AGENDA ============================ */

const NOTICIAS = [
  { id: 'n1', fecha: '2026-06-11', titulo: 'Definida la última jornada del Apertura 2026', resumen: 'Volcanes y Pampa cierran la fase regular este viernes en Liberia. La transmisión estará disponible para toda la comunidad desde VolleyTool.', etiqueta: 'Liga' },
  { id: 'n2', fecha: '2026-06-08', titulo: 'Convocatoria abierta para la Selección U-19 femenina', resumen: 'El cuerpo técnico nacional anunció microciclos en el CNDR de Hatillo. Los clubes pueden postular jugadoras con su ficha de VolleyTool actualizada.', etiqueta: 'Selecciones' },
  { id: 'n3', fecha: '2026-06-05', titulo: 'Spike Performance se integrará a VolleyTool', resumen: 'Las métricas físicas (salto vertical, alcance de ataque y bloqueo) se sincronizarán automáticamente con la ficha de cada jugador.', etiqueta: 'Producto' },
  { id: 'n4', fecha: '2026-05-29', titulo: 'Clínica gratuita de estadística aplicada al voleibol', resumen: 'Taller para anotadores y asistentes técnicos: cómo capturar datos en vivo y leer la efectividad por rotación. Cupo limitado.', etiqueta: 'Comunidad' },
  { id: 'n5', fecha: '2026-05-24', titulo: 'Lleno total en el Eddy Bermúdez para ver al Caribe', resumen: 'La afición limonense volvió a llenar el gimnasio. La transmisión del partido superó las mil reproducciones en VolleyTool.', etiqueta: 'Liga' },
];

const AGENDA = [
  { fecha: '2026-06-12', hora: '5:00 p. m.', evento: 'Pampa de Guanacaste vs Volcanes de Heredia · Jornada 6 (F)', lugar: 'Liberia' },
  { fecha: '2026-06-12', hora: '7:30 p. m.', evento: 'Brumosas de Cartago vs Ticas de San José · Jornada 6 (F) · EN VIVO', lugar: 'Cartago' },
  { fecha: '2026-06-14', hora: '5:00 p. m. y 7:30 p. m.', evento: 'Jornada 6 masculina: Cima vs Caribe · Erizos vs Olas', lugar: 'San Isidro / Alajuela' },
  { fecha: '2026-06-20', hora: 'Por definir', evento: 'Semifinales del Torneo Apertura 2026', lugar: 'Por definir' },
  { fecha: '2026-06-27', hora: 'Por definir', evento: 'Final nacional · Apertura 2026', lugar: 'Gimnasio Nacional' },
];

/* ============================ HELPERS PÚBLICOS ============================ */

function jugadoresDe(equipoId) {
  return JUGADORES.filter(j => j.equipoId === equipoId);
}

function jugador(id) {
  return JUGADORES.find(j => j.id === id);
}

// Tabla de posiciones (puntuación FIVB: 3-0/3-1 → 3 pts; 3-2 → 2 y 1)
function tablaPosiciones(categoria, partidosExtra = []) {
  const filas = {};
  EQUIPOS.filter(e => e.categoria === categoria).forEach(e => {
    filas[e.id] = { equipoId: e.id, pj: 0, pg: 0, pp: 0, setsF: 0, setsC: 0, pts: 0 };
  });
  PARTIDOS.concat(partidosExtra)
    .filter(p => p.categoria === categoria && p.estado === 'finalizado')
    .forEach(p => {
      const f = filas[p.local], g = filas[p.visita];
      if (!f || !g) return;
      const setsL = p.sets.filter(m => m[0] > m[1]).length;
      const setsV = p.sets.length - setsL;
      f.pj++; g.pj++;
      f.setsF += setsL; f.setsC += setsV;
      g.setsF += setsV; g.setsC += setsL;
      const ganoLocal = setsL > setsV;
      const [w, l] = ganoLocal ? [f, g] : [g, f];
      w.pg++; l.pp++;
      if (Math.min(setsL, setsV) === 2) { w.pts += 2; l.pts += 1; }
      else { w.pts += 3; }
    });
  return Object.values(filas).sort((a, b) => b.pts - a.pts || (b.setsF - b.setsC) - (a.setsF - a.setsC));
}

window.DEMO = {
  TORNEO, EQUIPOS, JUGADORES, PARTIDOS, VIDEOS_EXTRA, NOTICIAS, AGENDA,
  equipo, jugador, jugadoresDe, tablaPosiciones,
};
