/* ============================================================
   VolleyTool CR — Lógica de la demo
   SPA sin dependencias: enrutado por hash, render por vistas.
   ============================================================ */

'use strict';

const D = window.DEMO;

/* ============================ UTILIDADES ============================ */

const $app = () => document.getElementById('app');

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

function parsearFecha(iso) {
  const [f, h] = String(iso).split('T');
  const [y, m, d] = f.split('-').map(Number);
  const [hh, mm] = (h || '12:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm || 0);
}

function fFecha(iso) {
  const d = parsearFecha(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

function fHora(iso) {
  const d = parsearFecha(iso);
  let h = d.getHours();
  const suf = h >= 12 ? 'p. m.' : 'a. m.';
  h = h % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${suf}`;
}

function edad(fechaNac) {
  const n = parsearFecha(fechaNac), hoy = new Date();
  let e = hoy.getFullYear() - n.getFullYear();
  if (hoy.getMonth() < n.getMonth() || (hoy.getMonth() === n.getMonth() && hoy.getDate() < n.getDate())) e--;
  return e;
}

function pct(num, den) {
  return den ? `${Math.round((num / den) * 100)}%` : '—';
}

function iniciales(nombre) {
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

/* ---------- Persistencia local (la demo recuerda lo que registrás) ---------- */

function leerLS(clave, porDefecto) {
  try { return JSON.parse(localStorage.getItem(clave)) ?? porDefecto; }
  catch { return porDefecto; }
}
function guardarLS(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

const jugadoresExtra = () => leerLS('vt_jugadores_extra', []);
const partidosCapturados = () => leerLS('vt_capturados', []);

function plantillaDe(equipoId) {
  return D.jugadoresDe(equipoId).concat(jugadoresExtra().filter(j => j.equipoId === equipoId));
}
function buscarJugador(id) {
  return D.jugador(id) || jugadoresExtra().find(j => j.id === id);
}
function listarPartidos() {
  return D.PARTIDOS.concat(partidosCapturados());
}
function partidoPorId(id) {
  return listarPartidos().find(p => p.id === id);
}

/* ============================ COMPONENTES ============================ */

function escudo(eq, tam = 'md') {
  return `<span class="escudo escudo-${tam}" style="--c:${eq.color}">${esc(eq.corto)}</span>`;
}

function avatar(j, tam = 'md') {
  const eq = D.equipo(j.equipoId);
  return `<span class="avatar avatar-${tam}" style="--c:${eq ? eq.color : '#888'}">${esc(iniciales(j.nombre))}</span>`;
}

function linkEquipo(eq, tam = 'sm') {
  return `<a class="link-equipo" href="#/equipo/${eq.id}">${escudo(eq, tam)} <span>${esc(eq.nombre)}</span></a>`;
}

function rachaDe(equipoId, n = 5) {
  const ults = listarPartidos()
    .filter(p => p.estado === 'finalizado' && (p.local === equipoId || p.visita === equipoId) && !p.capturado)
    .sort((a, b) => parsearFecha(b.fecha) - parsearFecha(a.fecha))
    .slice(0, n).reverse();
  return `<span class="racha">${ults.map(p => {
    const gano = p.ganador === equipoId;
    return `<span class="punto-racha ${gano ? 'v' : 'd'}" title="${gano ? 'Victoria' : 'Derrota'} · J${p.jornada}">${gano ? 'V' : 'D'}</span>`;
  }).join('')}</span>`;
}

function setsGanados(p) {
  const l = p.sets.filter(m => m[0] > m[1]).length;
  return [l, p.sets.length - l];
}

function tarjetaPartido(p) {
  const eL = D.equipo(p.local), eV = D.equipo(p.visita);
  let centro, badge = '';
  if (p.estado === 'finalizado') {
    const [sl, sv] = setsGanados(p);
    centro = `<div class="marcador-sets"><b>${sl}</b><span>–</span><b>${sv}</b></div>
              <div class="detalle-sets">${p.sets.map(m => `${m[0]}-${m[1]}`).join(' · ')}</div>`;
    if (p.capturado) badge = '<span class="badge badge-captura">Capturado en demo</span>';
  } else if (p.estado === 'envivo') {
    centro = `<div class="marcador-sets en-vivo-num"><b>${p.envivo.marcadorSets[0]}</b><span>–</span><b>${p.envivo.marcadorSets[1]}</b></div>
              <div class="detalle-sets">Set ${p.envivo.set}: ${p.envivo.puntos[0]}-${p.envivo.puntos[1]}</div>`;
    badge = '<span class="badge badge-vivo">● EN VIVO</span>';
  } else {
    centro = `<div class="marcador-sets hora-prog">${fHora(p.fecha)}</div><div class="detalle-sets">${esc(p.sede)}</div>`;
    badge = '<span class="badge badge-prog">Programado</span>';
  }
  return `
  <a class="tarjeta tarjeta-partido" href="#/partido/${p.id}">
    <div class="tp-meta"><span>${fFecha(p.fecha)} · ${esc(p.capturado ? 'Captura propia' : `J${p.jornada} ${p.categoria === 'Femenino' ? '(F)' : '(M)'}`)}</span>${badge}</div>
    <div class="tp-cuerpo">
      <div class="tp-equipo">${escudo(eL)}<span>${esc(eL.nombre)}</span></div>
      <div class="tp-centro">${centro}</div>
      <div class="tp-equipo tp-der">${escudo(eV)}<span>${esc(eV.nombre)}</span></div>
    </div>
  </a>`;
}

function tablaHTML(categoria) {
  const filas = D.tablaPosiciones(categoria);
  return `
  <table class="tabla">
    <thead><tr><th>#</th><th class="izq">Equipo</th><th>PJ</th><th>PG</th><th>PP</th><th>Sets</th><th>Pts</th></tr></thead>
    <tbody>${filas.map((f, i) => {
      const e = D.equipo(f.equipoId);
      return `<tr class="${i === 0 ? 'lider' : ''}">
        <td>${i + 1}</td>
        <td class="izq"><a class="link-equipo" href="#/equipo/${e.id}">${escudo(e, 'xs')} ${esc(e.nombre)}</a></td>
        <td>${f.pj}</td><td>${f.pg}</td><td>${f.pp}</td>
        <td>${f.setsF}–${f.setsC}</td><td><b>${f.pts}</b></td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

/* ============================ GRÁFICOS (SVG / CSS) ============================ */

function svgRadar(radar, color) {
  const ejes = Object.keys(radar), vals = Object.values(radar);
  const W = 360, H = 290, cx = W / 2, cy = H / 2 + 6, r = 82, N = ejes.length;
  const punto = (i, frac) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    return [cx + Math.cos(ang) * r * frac, cy + Math.sin(ang) * r * frac];
  };
  const anillo = f => `<polygon points="${ejes.map((_, i) => punto(i, f).join(',')).join(' ')}" class="radar-anillo"/>`;
  const lineas = ejes.map((_, i) => { const [x, y] = punto(i, 1); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="radar-eje"/>`; }).join('');
  const poligono = `<polygon points="${vals.map((v, i) => punto(i, v / 100).join(',')).join(' ')}" fill="${color}33" stroke="${color}" stroke-width="2"/>`;
  const puntos = vals.map((v, i) => { const [x, y] = punto(i, v / 100); return `<circle cx="${x}" cy="${y}" r="3.5" fill="${color}"/>`; }).join('');
  const etiquetas = ejes.map((e, i) => {
    const [x, y] = punto(i, 1.25);
    const anchor = Math.abs(x - cx) < 8 ? 'middle' : (x > cx ? 'start' : 'end');
    return `<text x="${x}" y="${y + 4}" text-anchor="${anchor}" class="radar-texto">${esc(e)} <tspan class="radar-valor">${vals[i]}</tspan></text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="radar" role="img" aria-label="Radar de habilidades">
    ${[0.25, 0.5, 0.75, 1].map(anillo).join('')}${lineas}${poligono}${puntos}${etiquetas}
  </svg>`;
}

function filaComparada(etiqueta, a, b, colorA, colorB, esPct = false) {
  const max = Math.max(a, b, 1);
  const f = v => esPct ? `${v}%` : v;
  return `<div class="cmp-fila">
    <div class="cmp-val">${f(a)}</div>
    <div class="cmp-barra cmp-izq"><span style="width:${(a / max) * 100}%;background:${colorA}"></span></div>
    <div class="cmp-eti">${esc(etiqueta)}</div>
    <div class="cmp-barra"><span style="width:${(b / max) * 100}%;background:${colorB}"></span></div>
    <div class="cmp-val">${f(b)}</div>
  </div>`;
}

function barrasRotacion(porRotacion, color) {
  return `<div class="rot-grid">${porRotacion.map(r => {
    const ef = r.ataques ? Math.round((r.kills / r.ataques) * 100) : 0;
    return `<div class="rot-col" title="R${r.rot}: ${r.kills} puntos en ${r.ataques} ataques">
      <div class="rot-ef">${ef}%</div>
      <div class="rot-barra"><span style="height:${Math.max(4, ef)}%;background:${color}"></span></div>
      <div class="rot-eti">R${r.rot}</div>
    </div>`;
  }).join('')}</div>`;
}

/* ============================ VISTA: INICIO ============================ */

function vistaInicio() {
  const enVivo = listarPartidos().find(p => p.estado === 'envivo');
  const proximos = listarPartidos().filter(p => p.estado === 'programado')
    .sort((a, b) => parsearFecha(a.fecha) - parsearFecha(b.fecha)).slice(0, 3);
  const totalVideos = D.PARTIDOS.filter(p => p.video).length + D.VIDEOS_EXTRA.length;

  let bloqueVivo = '';
  if (enVivo) {
    const eL = D.equipo(enVivo.local), eV = D.equipo(enVivo.visita);
    bloqueVivo = `
    <section class="panel panel-vivo">
      <div class="pv-cab"><span class="badge badge-vivo">● EN VIVO</span>
        <span class="pv-meta">${esc(enVivo.torneo)} · ${esc(enVivo.sede)} · 👁 ${enVivo.envivo.espectadores.toLocaleString('es-CR')} espectadores</span></div>
      <div class="pv-cuerpo">
        <div class="pv-equipo">${escudo(eL, 'lg')}<b>${esc(eL.nombre)}</b></div>
        <div class="pv-marcador">
          <div class="pv-sets">${enVivo.envivo.marcadorSets[0]} – ${enVivo.envivo.marcadorSets[1]}</div>
          <div class="pv-puntos">Set ${enVivo.envivo.set} · ${enVivo.envivo.puntos[0]}-${enVivo.envivo.puntos[1]}</div>
        </div>
        <div class="pv-equipo">${escudo(eV, 'lg')}<b>${esc(eV.nombre)}</b></div>
      </div>
      <div class="pv-acciones">
        <button class="boton boton-primario" onclick="vtAbrirPlayer('${enVivo.id}')">▶ Ver transmisión</button>
        <a class="boton" href="#/partido/${enVivo.id}">Detalles del partido</a>
      </div>
    </section>`;
  }

  $app().innerHTML = `
  <section class="hero">
    <h1>El voleibol de Costa Rica,<br><span class="acento">en un solo lugar</span></h1>
    <p>Estadísticas de partidos, fichas de jugadores, transmisiones y scouting de rivales
       para equipos, cuerpo técnico y afición.</p>
    <div class="hero-acciones">
      <a class="boton boton-primario" href="#/captura">📋 Capturar estadísticas</a>
      <a class="boton" href="#/equipos">Explorar equipos</a>
    </div>
    <div class="hero-kpis">
      <div class="kpi"><b>${D.EQUIPOS.length}</b><span>equipos registrados</span></div>
      <div class="kpi"><b>${D.JUGADORES.length + jugadoresExtra().length}</b><span>jugadores con ficha</span></div>
      <div class="kpi"><b>${listarPartidos().filter(p => p.estado === 'finalizado').length}</b><span>partidos con estadísticas</span></div>
      <div class="kpi"><b>${totalVideos}</b><span>grabaciones disponibles</span></div>
    </div>
  </section>

  ${bloqueVivo}

  <div class="grid-2">
    <section class="panel">
      <h2>Próximos partidos</h2>
      <div class="lista-partidos">${proximos.map(tarjetaPartido).join('') || '<p class="vacio">No hay partidos programados.</p>'}</div>
      <a class="ver-mas" href="#/partidos">Ver calendario completo →</a>
    </section>
    <section class="panel">
      <h2>Noticias de la comunidad</h2>
      ${D.NOTICIAS.slice(0, 3).map(n => `
        <article class="noticia-mini">
          <div class="noticia-meta"><span class="badge badge-suave">${esc(n.etiqueta)}</span> ${fFecha(n.fecha)}</div>
          <h3>${esc(n.titulo)}</h3><p>${esc(n.resumen)}</p>
        </article>`).join('')}
      <a class="ver-mas" href="#/comunidad">Ir a la comunidad →</a>
    </section>
  </div>

  <div class="grid-2">
    <section class="panel"><h2>Posiciones · Femenino</h2>${tablaHTML('Femenino')}</section>
    <section class="panel"><h2>Posiciones · Masculino</h2>${tablaHTML('Masculino')}</section>
  </div>

  <p class="nota-torneo">${esc(D.TORNEO)} · Datos ficticios de demostración</p>`;
}

/* ============================ VISTA: EQUIPOS ============================ */

function vistaEquipos(filtro = 'Todos') {
  const equipos = D.EQUIPOS.filter(e => filtro === 'Todos' || e.categoria === filtro);
  $app().innerHTML = `
  <section class="cab-seccion">
    <h1>Equipos</h1>
    <p>Cada club administra su plantilla, sus estadísticas y sus grabaciones desde un mismo perfil.</p>
    <div class="chips">${['Todos', 'Femenino', 'Masculino'].map(f =>
      `<a class="chip ${f === filtro ? 'activo' : ''}" href="#/equipos${f === 'Todos' ? '' : '/' + f}">${f}</a>`).join('')}</div>
  </section>
  <div class="grid-tarjetas">
    ${equipos.map(e => {
      const fila = D.tablaPosiciones(e.categoria).find(f => f.equipoId === e.id);
      const pos = D.tablaPosiciones(e.categoria).findIndex(f => f.equipoId === e.id) + 1;
      return `
      <a class="tarjeta tarjeta-equipo" href="#/equipo/${e.id}">
        ${escudo(e, 'xl')}
        <h3>${esc(e.nombre)}</h3>
        <div class="te-meta">${esc(e.provincia)} · ${esc(e.categoria)}</div>
        <div class="te-stats">
          <span><b>${pos}.º</b> lugar</span>
          <span><b>${fila.pg}</b>V – <b>${fila.pp}</b>D</span>
          <span><b>${plantillaDe(e.id).length}</b> jugadores</span>
        </div>
        <div class="te-racha">${rachaDe(e.id)}</div>
      </a>`;
    }).join('')}
  </div>`;
}

/* ============================ VISTA: EQUIPO ============================ */

function statsAgregadasEquipo(equipoId) {
  const jugados = D.PARTIDOS.filter(p => p.estado === 'finalizado' && (p.local === equipoId || p.visita === equipoId));
  const agg = { partidos: jugados.length, kills: 0, ataques: 0, errAtaque: 0, aces: 0, saques: 0, errSaque: 0, bloqueos: 0, recepPerf: 0, recepTotal: 0 };
  const porRot = Array.from({ length: 6 }, (_, i) => ({ rot: i + 1, ataques: 0, kills: 0, puntos: 0 }));
  jugados.forEach(p => {
    const s = p.stats[equipoId];
    if (!s) return;
    ['kills', 'ataques', 'errAtaque', 'aces', 'saques', 'errSaque', 'bloqueos', 'recepPerf', 'recepTotal'].forEach(k => agg[k] += s[k]);
    s.porRotacion.forEach((r, i) => { porRot[i].ataques += r.ataques; porRot[i].kills += r.kills; porRot[i].puntos += r.puntos; });
  });
  return { agg, porRot };
}

function vistaEquipo(id, tab = 'plantilla') {
  const e = D.equipo(id);
  if (!e) return vista404();
  const tabla = D.tablaPosiciones(e.categoria);
  const fila = tabla.find(f => f.equipoId === id);
  const pos = tabla.findIndex(f => f.equipoId === id) + 1;

  const tabs = [['plantilla', 'Plantilla'], ['estadisticas', 'Estadísticas'], ['partidos', 'Partidos'], ['videos', 'Videos']];

  let cuerpo = '';
  if (tab === 'plantilla') cuerpo = tabPlantilla(e);
  else if (tab === 'estadisticas') cuerpo = tabEstadisticas(e);
  else if (tab === 'partidos') cuerpo = tabPartidosEquipo(e);
  else if (tab === 'videos') cuerpo = tabVideosEquipo(e);

  $app().innerHTML = `
  <section class="cab-equipo" style="--c:${e.color}">
    <div class="ce-principal">
      ${escudo(e, 'xxl')}
      <div>
        <div class="migas"><a href="#/equipos">Equipos</a> / ${esc(e.categoria)}</div>
        <h1>${esc(e.nombre)}</h1>
        <div class="ce-meta">📍 ${esc(e.sede)} · Fundado en ${e.fundado} · DT: ${esc(e.entrenador)}</div>
      </div>
    </div>
    <div class="ce-stats">
      <div class="kpi"><b>${pos}.º</b><span>posición</span></div>
      <div class="kpi"><b>${fila.pg}–${fila.pp}</b><span>récord</span></div>
      <div class="kpi"><b>${fila.setsF}–${fila.setsC}</b><span>sets</span></div>
      <div class="kpi">${rachaDe(id)}<span>racha</span></div>
    </div>
  </section>
  <nav class="tabs">${tabs.map(([t, n]) => `<a class="tab ${t === tab ? 'activo' : ''}" href="#/equipo/${id}/${t}">${n}</a>`).join('')}</nav>
  ${cuerpo}`;
}

function tabPlantilla(e) {
  const js = plantillaDe(e.id);
  return `
  <section class="panel">
    <div class="panel-cab">
      <h2>Plantilla (${js.length})</h2>
      <button class="boton boton-primario" onclick="vtFormJugador('${e.id}')">＋ Registrar jugador</button>
    </div>
    <div class="tabla-envoltura"><table class="tabla tabla-clic">
      <thead><tr><th>#</th><th class="izq">Nombre</th><th class="izq">Posición</th><th>Edad</th><th>Altura</th><th>Salto vert.</th><th>Lateralidad</th></tr></thead>
      <tbody>${js.map(j => `
        <tr onclick="location.hash='#/jugador/${j.id}'">
          <td><b>${j.numero}</b></td>
          <td class="izq">${avatar(j, 'xs')} ${esc(j.nombre)} ${j.capitan ? '<span class="badge badge-cap">C</span>' : ''} ${j.extra ? '<span class="badge badge-nuevo">Nuevo</span>' : ''}</td>
          <td class="izq">${esc(j.posicion)}</td>
          <td>${edad(j.fechaNacimiento)}</td>
          <td>${j.alturaCm} cm</td>
          <td>${j.fisico.saltoVerticalCm ? j.fisico.saltoVerticalCm + ' cm' : '—'}</td>
          <td>${esc(j.lateralidad)}</td>
        </tr>`).join('')}</tbody>
    </table></div>
    <p class="nota">La ficha completa de cada jugador (cédula, tipo de sangre, métricas físicas) se abre al hacer clic.
       Las métricas físicas se sincronizarán con <b>Spike Performance</b>.</p>
  </section>`;
}

function tabEstadisticas(e) {
  const { agg, porRot } = statsAgregadasEquipo(e.id);
  const top = plantillaDe(e.id).filter(j => j.stats.puntos > 0)
    .sort((a, b) => b.stats.puntos - a.stats.puntos).slice(0, 3);
  return `
  <section class="panel">
    <h2>Rendimiento en el torneo</h2>
    <div class="grid-kpis">
      <div class="kpi-caja"><b>${pct(agg.kills, agg.ataques)}</b><span>ataques en punto (${agg.kills}/${agg.ataques})</span></div>
      <div class="kpi-caja"><b>${agg.ataques ? Math.round(((agg.kills - agg.errAtaque) / agg.ataques) * 100) : 0}%</b><span>eficiencia de ataque</span></div>
      <div class="kpi-caja"><b>${pct(agg.aces, agg.saques)}</b><span>aces por saque (${agg.aces} aces)</span></div>
      <div class="kpi-caja"><b>${pct(agg.saques - agg.errSaque, agg.saques)}</b><span>saques exitosos</span></div>
      <div class="kpi-caja"><b>${agg.bloqueos}</b><span>puntos de bloqueo</span></div>
      <div class="kpi-caja"><b>${pct(agg.recepPerf, agg.recepTotal)}</b><span>recepción perfecta</span></div>
    </div>
  </section>
  <div class="grid-2">
    <section class="panel">
      <h2>Efectividad de ataque por rotación</h2>
      <p class="nota">Promedio de los ${agg.partidos} partidos del torneo. Útil para detectar rotaciones fuertes y débiles.</p>
      ${barrasRotacion(porRot, e.color)}
    </section>
    <section class="panel">
      <h2>Máximas anotadoras del equipo</h2>
      ${top.map((j, i) => `
        <a class="fila-top" href="#/jugador/${j.id}">
          <span class="ft-pos">${i + 1}</span>${avatar(j)}
          <span class="ft-nombre">${esc(j.nombre)}<small>${esc(j.posicion)} · #${j.numero}</small></span>
          <span class="ft-valor"><b>${j.stats.puntos}</b><small>puntos</small></span>
        </a>`).join('')}
    </section>
  </div>`;
}

function tabPartidosEquipo(e) {
  const ps = listarPartidos().filter(p => p.local === e.id || p.visita === e.id)
    .sort((a, b) => parsearFecha(b.fecha) - parsearFecha(a.fecha));
  return `<section class="panel"><h2>Partidos</h2><div class="lista-partidos">${ps.map(tarjetaPartido).join('')}</div></section>`;
}

function tabVideosEquipo(e) {
  const vids = D.PARTIDOS.filter(p => p.video && (p.local === e.id || p.visita === e.id));
  return `
  <section class="panel">
    <h2>Grabaciones de sus partidos</h2>
    <p class="nota">Disponibles para toda la comunidad: ideales para que los rivales preparen sus partidos y para que la afición reviva los mejores momentos.</p>
    <div class="grid-videos">${vids.map(tarjetaVideoPartido).join('') || '<p class="vacio">Sin grabaciones todavía.</p>'}</div>
  </section>`;
}

/* ============================ VISTA: JUGADOR ============================ */

function vistaJugador(id) {
  const j = buscarJugador(id);
  if (!j) return vista404();
  const e = D.equipo(j.equipoId);
  const s = j.stats;
  const sinStats = !s || (!s.setsJugados && !s.puntos);

  $app().innerHTML = `
  <section class="cab-equipo" style="--c:${e.color}">
    <div class="ce-principal">
      ${avatar(j, 'xxl')}
      <div>
        <div class="migas"><a href="#/equipos">Equipos</a> / <a href="#/equipo/${e.id}">${esc(e.nombre)}</a></div>
        <h1>${esc(j.nombre)} ${j.capitan ? '<span class="badge badge-cap">Capitán</span>' : ''}</h1>
        <div class="ce-meta">#${j.numero} · ${esc(j.posicion)} · ${esc(e.categoria)} · 🇨🇷 ${esc(j.nacionalidad)}</div>
      </div>
    </div>
  </section>

  <div class="grid-3">
    <section class="panel">
      <h2>Ficha personal</h2>
      <dl class="ficha">
        <div><dt>Cédula</dt><dd>${esc(j.cedula)}</dd></div>
        <div><dt>Nacimiento</dt><dd>${fFecha(j.fechaNacimiento)} (${edad(j.fechaNacimiento)} años)</dd></div>
        <div><dt>Tipo de sangre</dt><dd><span class="badge badge-sangre">${esc(j.tipoSangre)}</span></dd></div>
        <div><dt>Lateralidad</dt><dd>${esc(j.lateralidad)}</dd></div>
        <div><dt>Altura</dt><dd>${j.alturaCm} cm</dd></div>
        <div><dt>Peso</dt><dd>${j.pesoKg} kg</dd></div>
      </dl>
    </section>

    <section class="panel">
      <div class="panel-cab"><h2>Métricas físicas</h2><span class="badge badge-spike">⚡ Spike Performance</span></div>
      <dl class="ficha">
        <div><dt>Salto vertical máx.</dt><dd><b>${j.fisico.saltoVerticalCm ? j.fisico.saltoVerticalCm + ' cm' : 'Sin medición'}</b></dd></div>
        <div><dt>Alcance de ataque</dt><dd>${j.fisico.alcanceAtaqueCm ? j.fisico.alcanceAtaqueCm + ' cm' : 'Sin medición'}</dd></div>
        <div><dt>Alcance de bloqueo</dt><dd>${j.fisico.alcanceBloqueoCm ? j.fisico.alcanceBloqueoCm + ' cm' : 'Sin medición'}</dd></div>
        <div><dt>Última medición</dt><dd>${j.fisico.ultimaMedicion ? fFecha(j.fisico.ultimaMedicion) : '—'}</dd></div>
      </dl>
      <p class="nota">En la versión completa, estas métricas se sincronizarán automáticamente desde la app <b>Spike Performance</b>.</p>
    </section>

    <section class="panel panel-centro">
      <h2>Perfil de habilidades</h2>
      ${j.radar ? svgRadar(j.radar, e.color) : '<p class="vacio">Se generará con sus primeras estadísticas.</p>'}
    </section>
  </div>

  <section class="panel">
    <h2>Estadísticas del ${esc(D.TORNEO)}</h2>
    ${sinStats ? '<p class="vacio">Esta ficha aún no tiene estadísticas registradas. Se irán acumulando con cada partido capturado.</p>' : `
    <div class="tabla-envoltura"><table class="tabla">
      <thead><tr><th>Sets</th><th>Puntos</th><th>Ataques pto.</th><th>% Ataque</th><th>Aces</th><th>Bloqueos</th><th>Recep. perfecta</th><th>Defensas</th><th>Asistencias</th></tr></thead>
      <tbody><tr>
        <td>${s.setsJugados}</td><td><b>${s.puntos}</b></td>
        <td>${s.kills}/${s.ataques}</td><td>${pct(s.kills, s.ataques)}</td>
        <td>${s.aces}</td><td>${s.bloqueos}</td>
        <td>${s.recepTotal ? `${pct(s.recepPerf, s.recepTotal)} (${s.recepPerf}/${s.recepTotal})` : '—'}</td>
        <td>${s.digs ?? 0}</td><td>${s.asistencias ?? 0}</td>
      </tr></tbody>
    </table></div>`}
  </section>`;
}

/* ============================ VISTA: PARTIDOS ============================ */

function vistaPartidos(filtro = 'Todos') {
  const todos = listarPartidos().filter(p => filtro === 'Todos' || p.categoria === filtro);
  const enVivo = todos.filter(p => p.estado === 'envivo');
  const proximos = todos.filter(p => p.estado === 'programado').sort((a, b) => parsearFecha(a.fecha) - parsearFecha(b.fecha));
  const jugados = todos.filter(p => p.estado === 'finalizado').sort((a, b) => parsearFecha(b.fecha) - parsearFecha(a.fecha));

  $app().innerHTML = `
  <section class="cab-seccion">
    <h1>Partidos</h1>
    <p>Resultados con estadísticas completas por set y por rotación, calendario y transmisiones.</p>
    <div class="chips">${['Todos', 'Femenino', 'Masculino'].map(f =>
      `<a class="chip ${f === filtro ? 'activo' : ''}" href="#/partidos${f === 'Todos' ? '' : '/' + f}">${f}</a>`).join('')}</div>
  </section>
  ${enVivo.length ? `<section class="panel"><h2>🔴 En vivo ahora</h2><div class="lista-partidos">${enVivo.map(tarjetaPartido).join('')}</div></section>` : ''}
  ${proximos.length ? `<section class="panel"><h2>Próximos</h2><div class="lista-partidos">${proximos.map(tarjetaPartido).join('')}</div></section>` : ''}
  <section class="panel"><h2>Resultados</h2><div class="lista-partidos">${jugados.map(tarjetaPartido).join('')}</div></section>`;
}

/* ============================ VISTA: PARTIDO ============================ */

function vistaPartido(id) {
  const p = partidoPorId(id);
  if (!p) return vista404();
  const eL = D.equipo(p.local), eV = D.equipo(p.visita);

  const cabecera = (centro) => `
  <section class="panel partido-cab">
    <div class="pc-meta">${esc(p.torneo)} · ${p.capturado ? 'Captura propia' : `Jornada ${p.jornada} (${p.categoria === 'Femenino' ? 'F' : 'M'})`} · ${fFecha(p.fecha)} · ${esc(p.sede)}</div>
    <div class="pv-cuerpo">
      <div class="pv-equipo"><a href="#/equipo/${eL.id}">${escudo(eL, 'xl')}</a><b>${esc(eL.nombre)}</b></div>
      <div class="pv-marcador">${centro}</div>
      <div class="pv-equipo"><a href="#/equipo/${eV.id}">${escudo(eV, 'xl')}</a><b>${esc(eV.nombre)}</b></div>
    </div>
  </section>`;

  if (p.estado === 'programado') {
    const previos = D.PARTIDOS.filter(x => x.estado === 'finalizado' &&
      ((x.local === p.local && x.visita === p.visita) || (x.local === p.visita && x.visita === p.local)));
    $app().innerHTML = cabecera(`<div class="pv-sets pv-hora">${fHora(p.fecha)}</div><div class="pv-puntos">${fFecha(p.fecha)}</div>`) + `
    <div class="grid-2">
      <section class="panel">
        <h2>Historial entre ambos</h2>
        <div class="lista-partidos">${previos.map(tarjetaPartido).join('') || '<p class="vacio">Primer enfrentamiento del torneo.</p>'}</div>
      </section>
      <section class="panel">
        <h2>Prepará este partido</h2>
        <p class="nota">Compará el rendimiento de ambos equipos y revisá las grabaciones del rival antes del juego.</p>
        <div class="hero-acciones">
          <a class="boton boton-primario" href="#/scouting/${p.local}/${p.visita}">🔍 Análisis de rivales</a>
          <a class="boton" href="#/videos">🎥 Ver grabaciones</a>
        </div>
      </section>
    </div>`;
    return;
  }

  if (p.estado === 'envivo') {
    $app().innerHTML = cabecera(`
      <div class="pv-sets en-vivo-num">${p.envivo.marcadorSets[0]} – ${p.envivo.marcadorSets[1]}</div>
      <div class="pv-puntos">Set ${p.envivo.set} · ${p.envivo.puntos[0]}-${p.envivo.puntos[1]}</div>
      <span class="badge badge-vivo">● EN VIVO</span>`) + `
    <section class="panel">
      <div class="player" onclick="vtAbrirPlayer('${p.id}')">
        <div class="player-overlay"><span class="badge badge-vivo">● EN VIVO</span><span>👁 ${p.envivo.espectadores.toLocaleString('es-CR')}</span></div>
        <button class="player-play" aria-label="Reproducir">▶</button>
        <div class="player-pie">${esc(eL.corto)} vs ${esc(eV.corto)} · Transmisión oficial</div>
      </div>
      <p class="nota">¿Estás en el gimnasio con la tableta del equipo? <a href="#/captura">Capturá las estadísticas en vivo →</a></p>
    </section>`;
    return;
  }

  // -------- Finalizado --------
  const [sl, sv] = setsGanados(p);
  const sL = p.stats ? p.stats[p.local] : null;
  const sV = p.stats ? p.stats[p.visita] : null;
  const mvp = p.mvp ? buscarJugador(p.mvp) : null;

  const efic = s => s.ataques ? Math.round(((s.kills - s.errAtaque) / s.ataques) * 100) : 0;
  const pctN = (n, d) => d ? Math.round((n / d) * 100) : 0;

  $app().innerHTML = cabecera(`
    <div class="pv-sets">${sl} – ${sv}</div>
    <div class="chips-sets">${p.sets.map((m, i) => `<span class="chip-set" title="Set ${i + 1}">${m[0]}-${m[1]}</span>`).join('')}</div>
    ${p.capturado ? '<span class="badge badge-captura">Capturado en demo</span>' : ''}`) + `

  ${sL && sV ? `
  <section class="panel">
    <h2>Comparativa del partido</h2>
    <div class="cmp-cab"><span>${escudo(eL, 'xs')} ${esc(eL.corto)}</span><span>${esc(eV.corto)} ${escudo(eV, 'xs')}</span></div>
    ${filaComparada('Ataques en punto', sL.kills, sV.kills, eL.color, eV.color)}
    ${filaComparada('Eficiencia de ataque', efic(sL), efic(sV), eL.color, eV.color, true)}
    ${filaComparada('Aces', sL.aces, sV.aces, eL.color, eV.color)}
    ${filaComparada('Saques exitosos', pctN(sL.saques - sL.errSaque, sL.saques), pctN(sV.saques - sV.errSaque, sV.saques), eL.color, eV.color, true)}
    ${filaComparada('Puntos de bloqueo', sL.bloqueos, sV.bloqueos, eL.color, eV.color)}
    ${filaComparada('Recepción perfecta', pctN(sL.recepPerf, sL.recepTotal), pctN(sV.recepPerf, sV.recepTotal), eL.color, eV.color, true)}
  </section>
  <div class="grid-2">
    <section class="panel"><h2>${esc(eL.corto)} · Ataque por rotación</h2>${barrasRotacion(sL.porRotacion, eL.color)}</section>
    <section class="panel"><h2>${esc(eV.corto)} · Ataque por rotación</h2>${barrasRotacion(sV.porRotacion, eV.color)}</section>
  </div>` : sL ? `
  <section class="panel">
    <h2>Estadísticas capturadas · ${esc(eL.nombre)}</h2>
    <div class="grid-kpis">
      <div class="kpi-caja"><b>${pct(sL.kills, sL.ataques)}</b><span>ataques en punto (${sL.kills}/${sL.ataques})</span></div>
      <div class="kpi-caja"><b>${pct(sL.aces, sL.saques)}</b><span>aces (${sL.aces}/${sL.saques} saques)</span></div>
      <div class="kpi-caja"><b>${pct(sL.saques - sL.errSaque, sL.saques)}</b><span>saques exitosos</span></div>
      <div class="kpi-caja"><b>${sL.bloqueos}</b><span>puntos de bloqueo</span></div>
      <div class="kpi-caja"><b>${pct(sL.recepPerf, sL.recepTotal)}</b><span>recepción perfecta</span></div>
    </div>
    <h2 style="margin-top:18px">Ataque por rotación</h2>
    ${barrasRotacion(sL.porRotacion, eL.color)}
    <p class="nota">En esta captura solo se registraron las acciones de ${esc(eL.nombre)}.</p>
  </section>` : ''}

  <div class="grid-2">
    ${mvp ? `
    <section class="panel">
      <h2>Jugador del partido</h2>
      <a class="fila-top" href="#/jugador/${mvp.id}">
        ${avatar(mvp, 'lg')}
        <span class="ft-nombre">${esc(mvp.nombre)}<small>${esc(mvp.posicion)} · ${esc(D.equipo(mvp.equipoId).nombre)}</small></span>
        <span class="badge badge-mvp">MVP</span>
      </a>
    </section>` : ''}
    ${p.video ? `
    <section class="panel">
      <h2>Grabación del partido</h2>
      <div class="player player-mini" onclick="vtAbrirPlayer('${p.id}')">
        <button class="player-play" aria-label="Reproducir">▶</button>
        <div class="player-pie">${p.video.duracion} · 👁 ${p.video.vistas.toLocaleString('es-CR')} reproducciones</div>
      </div>
      <p class="nota">Disponible para todos los equipos de la liga: ideal para el scouting del rival.</p>
    </section>` : ''}
  </div>`;
}

/* ============================ VISTA: VIDEOS ============================ */

function tarjetaVideoPartido(p) {
  const eL = D.equipo(p.local), eV = D.equipo(p.visita);
  const [sl, sv] = setsGanados(p);
  return `
  <div class="tarjeta-video" onclick="vtAbrirPlayer('${p.id}')">
    <div class="tv-thumb" style="background:linear-gradient(135deg, ${eL.color}55, ${eV.color}55)">
      <span class="tv-vs">${escudo(eL)}<b>${sl}–${sv}</b>${escudo(eV)}</span>
      <span class="tv-dur">${p.video.duracion}</span>
    </div>
    <div class="tv-info">
      <b>${esc(eL.corto)} vs ${esc(eV.corto)} · Jornada ${p.jornada} (${p.categoria === 'Femenino' ? 'F' : 'M'})</b>
      <span>${fFecha(p.fecha)} · 👁 ${p.video.vistas.toLocaleString('es-CR')}</span>
    </div>
  </div>`;
}

function vistaVideos() {
  const enVivo = listarPartidos().find(p => p.estado === 'envivo');
  const grabaciones = D.PARTIDOS.filter(p => p.video).sort((a, b) => parsearFecha(b.fecha) - parsearFecha(a.fecha));

  let bloqueVivo = '';
  if (enVivo) {
    const eL = D.equipo(enVivo.local), eV = D.equipo(enVivo.visita);
    bloqueVivo = `
    <section class="panel">
      <h2>🔴 Transmisión en vivo</h2>
      <div class="player" onclick="vtAbrirPlayer('${enVivo.id}')">
        <div class="player-overlay"><span class="badge badge-vivo">● EN VIVO</span><span>👁 ${enVivo.envivo.espectadores.toLocaleString('es-CR')}</span></div>
        <button class="player-play" aria-label="Reproducir">▶</button>
        <div class="player-pie">${esc(eL.nombre)} vs ${esc(eV.nombre)} · Set ${enVivo.envivo.set} (${enVivo.envivo.puntos[0]}-${enVivo.envivo.puntos[1]})</div>
      </div>
    </section>`;
  }

  $app().innerHTML = `
  <section class="cab-seccion">
    <h1>Transmisiones y grabaciones</h1>
    <p>Los equipos transmiten sus partidos y la grabación queda disponible para el scouting de los rivales y para la afición, desde el teléfono o la computadora.</p>
  </section>
  ${bloqueVivo}
  <section class="panel">
    <h2>Grabaciones de partidos</h2>
    <div class="grid-videos">${grabaciones.map(tarjetaVideoPartido).join('')}</div>
  </section>
  <section class="panel">
    <h2>Contenido de la comunidad</h2>
    <div class="grid-videos">${D.VIDEOS_EXTRA.map(v => `
      <div class="tarjeta-video" onclick="vtAbrirPlayerExtra('${v.id}')">
        <div class="tv-thumb tv-thumb-extra"><span class="tv-tipo">${esc(v.tipo)}</span><span class="tv-dur">${v.duracion}</span></div>
        <div class="tv-info"><b>${esc(v.titulo)}</b><span>${fFecha(v.fecha)} · 👁 ${v.vistas.toLocaleString('es-CR')}</span></div>
      </div>`).join('')}</div>
  </section>`;
}

/* ============================ VISTA: SCOUTING ============================ */

function vistaScouting(idA, idB) {
  const a = D.equipo(idA) || D.equipo('volcanes');
  const candidatosB = D.EQUIPOS.filter(e => e.categoria === a.categoria && e.id !== a.id);
  const b = (D.equipo(idB) && D.equipo(idB).categoria === a.categoria && idB !== a.id) ? D.equipo(idB) : candidatosB[0];

  const sa = statsAgregadasEquipo(a.id), sb = statsAgregadasEquipo(b.id);
  const ta = D.tablaPosiciones(a.categoria);
  const fa = ta.find(f => f.equipoId === a.id), fb = ta.find(f => f.equipoId === b.id);

  const prom = (s, k) => s.agg.partidos ? (s.agg[k] / s.agg.partidos) : 0;
  const efic = s => s.agg.ataques ? Math.round(((s.agg.kills - s.agg.errAtaque) / s.agg.ataques) * 100) : 0;

  const mejorRot = s => s.porRot.reduce((m, r) => (r.ataques && r.kills / r.ataques > (m.ataques ? m.kills / m.ataques : -1)) ? r : m, s.porRot[0]);
  const peorRot = s => s.porRot.reduce((m, r) => (r.ataques && r.kills / r.ataques < (m.ataques ? m.kills / m.ataques : 2)) ? r : m, s.porRot[0]);

  const informe = (eq, s, fila) => {
    const mr = mejorRot(s), pr = peorRot(s);
    const claves = plantillaDe(eq.id).filter(j => j.stats.puntos > 0).sort((x, y) => y.stats.puntos - x.stats.puntos).slice(0, 2);
    return `
    <div class="informe">
      <h3>${escudo(eq, 'sm')} ${esc(eq.nombre)}</h3>
      <ul>
        <li>✅ <b>Fortaleza:</b> rotación R${mr.rot} con ${pct(mr.kills, mr.ataques)} de efectividad de ataque.</li>
        <li>⚠️ <b>Punto débil:</b> rotación R${pr.rot} (${pct(pr.kills, pr.ataques)}). Conviene presionar con el saque en esa rotación.</li>
        <li>🎯 <b>Recepción:</b> ${pct(s.agg.recepPerf, s.agg.recepTotal)} de recepción perfecta en el torneo.</li>
        <li>⭐ <b>A vigilar:</b> ${claves.map(j => `<a href="#/jugador/${j.id}">${esc(j.nombre)}</a> (${j.stats.puntos} pts)`).join(' y ')}.</li>
        <li>📈 <b>Récord:</b> ${fila.pg}V–${fila.pp}D, sets ${fila.setsF}–${fila.setsC}.</li>
      </ul>
    </div>`;
  };

  const opciones = (sel, eqs) => eqs.map(e => `<option value="${e.id}" ${e.id === sel ? 'selected' : ''}>${esc(e.nombre)}</option>`).join('');

  $app().innerHTML = `
  <section class="cab-seccion">
    <h1>Scouting de rivales</h1>
    <p>Compará el rendimiento de dos equipos con los datos del torneo y obtené un informe automático para preparar el partido.</p>
    <div class="scouting-selects">
      <select id="sel-a" onchange="vtScoutingCambiar()">${opciones(a.id, D.EQUIPOS)}</select>
      <span class="vs">VS</span>
      <select id="sel-b" onchange="vtScoutingCambiar()">${opciones(b.id, candidatosB)}</select>
    </div>
  </section>

  <section class="panel">
    <h2>Comparativa del torneo (promedios por partido)</h2>
    <div class="cmp-cab"><span>${escudo(a, 'xs')} ${esc(a.corto)}</span><span>${esc(b.corto)} ${escudo(b, 'xs')}</span></div>
    ${filaComparada('Ataques en punto', Math.round(prom(sa, 'kills')), Math.round(prom(sb, 'kills')), a.color, b.color)}
    ${filaComparada('Eficiencia de ataque', efic(sa), efic(sb), a.color, b.color, true)}
    ${filaComparada('Aces', Math.round(prom(sa, 'aces') * 10) / 10, Math.round(prom(sb, 'aces') * 10) / 10, a.color, b.color)}
    ${filaComparada('Puntos de bloqueo', Math.round(prom(sa, 'bloqueos')), Math.round(prom(sb, 'bloqueos')), a.color, b.color)}
    ${filaComparada('Recepción perfecta', sa.agg.recepTotal ? Math.round(sa.agg.recepPerf / sa.agg.recepTotal * 100) : 0, sb.agg.recepTotal ? Math.round(sb.agg.recepPerf / sb.agg.recepTotal * 100) : 0, a.color, b.color, true)}
  </section>

  <div class="grid-2">
    <section class="panel"><h2>${esc(a.corto)} · Ataque por rotación</h2>${barrasRotacion(sa.porRot, a.color)}</section>
    <section class="panel"><h2>${esc(b.corto)} · Ataque por rotación</h2>${barrasRotacion(sb.porRot, b.color)}</section>
  </div>

  <section class="panel">
    <h2>Informe automático de scouting</h2>
    <div class="grid-2">${informe(a, sa, fa)}${informe(b, sb, fb)}</div>
  </section>

  <section class="panel">
    <h2>Grabaciones para estudiar al rival</h2>
    <div class="grid-videos">${D.PARTIDOS.filter(p => p.video && (p.local === b.id || p.visita === b.id)).slice(0, 4).map(tarjetaVideoPartido).join('')}</div>
  </section>`;
}

function vtScoutingCambiar() {
  const a = document.getElementById('sel-a').value;
  const b = document.getElementById('sel-b').value;
  location.hash = `#/scouting/${a}/${b}`;
}

/* ============================ VISTA: COMUNIDAD ============================ */

function vistaComunidad() {
  $app().innerHTML = `
  <section class="cab-seccion">
    <h1>Comunidad</h1>
    <p>Noticias, calendario y recursos del voleibol costarricense, en un solo lugar.</p>
  </section>
  <div class="grid-2">
    <section class="panel">
      <h2>Noticias</h2>
      ${D.NOTICIAS.map(n => `
        <article class="noticia-mini">
          <div class="noticia-meta"><span class="badge badge-suave">${esc(n.etiqueta)}</span> ${fFecha(n.fecha)}</div>
          <h3>${esc(n.titulo)}</h3><p>${esc(n.resumen)}</p>
        </article>`).join('')}
    </section>
    <div>
      <section class="panel">
        <h2>Agenda</h2>
        <div class="tabla-envoltura"><table class="tabla">
          <thead><tr><th class="izq">Fecha</th><th class="izq">Evento</th><th class="izq">Lugar</th></tr></thead>
          <tbody>${D.AGENDA.map(a => `<tr>
            <td class="izq"><b>${fFecha(a.fecha)}</b><br><small>${esc(a.hora)}</small></td>
            <td class="izq">${esc(a.evento)}</td><td class="izq">${esc(a.lugar)}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>
      <section class="panel">
        <h2>En la versión completa</h2>
        <ul class="lista-roadmap">
          <li>👥 Cuentas para clubes, cuerpo técnico, jugadores y afición.</li>
          <li>⚡ Sincronización de métricas físicas con <b>Spike Performance</b>.</li>
          <li>🎥 Transmisión real desde el teléfono y archivo de video en la nube.</li>
          <li>📊 Estadísticas individuales por jugador en cada partido.</li>
          <li>🏆 Gestión de torneos, inscripciones y programación de árbitros.</li>
        </ul>
        <p class="nota">¿Qué más le agregarías? Esta demo existe justamente para escuchar a la comunidad.</p>
      </section>
    </div>
  </div>`;
}

/* ============================ VISTA: CAPTURA EN VIVO ============================ */

const ACCIONES = [
  { grupo: 'Saque', items: [
    { id: 'saque_ace',       eti: 'Ace',           delta: [1, 0], cl: 'ok' },
    { id: 'saque_dentro',    eti: 'En juego',      delta: [0, 0], cl: 'neutro' },
    { id: 'saque_error',     eti: 'Error',         delta: [0, 1], cl: 'mal' },
  ]},
  { grupo: 'Ataque', items: [
    { id: 'ataque_punto',    eti: 'Punto',         delta: [1, 0], cl: 'ok' },
    { id: 'ataque_defendido',eti: 'Defendido',     delta: [0, 0], cl: 'neutro' },
    { id: 'ataque_bloqueado',eti: 'Bloqueado',     delta: [0, 1], cl: 'mal' },
    { id: 'ataque_error',    eti: 'Error',         delta: [0, 1], cl: 'mal' },
  ]},
  { grupo: 'Bloqueo', items: [
    { id: 'bloqueo_punto',   eti: 'Punto',         delta: [1, 0], cl: 'ok' },
    { id: 'bloqueo_toque',   eti: 'Toque',         delta: [0, 0], cl: 'neutro' },
    { id: 'bloqueo_error',   eti: 'Error de red',  delta: [0, 1], cl: 'mal' },
  ]},
  { grupo: 'Recepción', items: [
    { id: 'recep_perfecta',  eti: 'Perfecta (#)',  delta: [0, 0], cl: 'ok' },
    { id: 'recep_buena',     eti: 'Buena',         delta: [0, 0], cl: 'neutro' },
    { id: 'recep_error',     eti: 'Error (ace rival)', delta: [0, 1], cl: 'mal' },
  ]},
  { grupo: 'Otros puntos del rally', items: [
    { id: 'rival_error',     eti: 'Error del rival', delta: [1, 0], cl: 'ok' },
    { id: 'rival_punto',     eti: 'Punto del rival', delta: [0, 1], cl: 'mal' },
  ]},
];

const ACCION_POR_ID = Object.fromEntries(ACCIONES.flatMap(g => g.items.map(i => [i.id, { ...i, grupo: g.grupo }])));
const ETI_ROT = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'];

let captura = leerLS('vt_captura', null);

function guardarCaptura() { guardarLS('vt_captura', captura); }

function vistaCaptura() {
  if (!captura) {
    const fem = D.EQUIPOS.filter(e => e.categoria === 'Femenino');
    $app().innerHTML = `
    <section class="cab-seccion">
      <h1>Captura de estadísticas en vivo</h1>
      <p>La planilla digital del equipo: registrá cada acción con un toque y obtené los porcentajes y la efectividad por rotación al instante.</p>
    </section>
    <section class="panel panel-estrecho">
      <h2>Configurar captura</h2>
      <label class="campo"><span>Mi equipo</span>
        <select id="cap-equipo">${D.EQUIPOS.map(e => `<option value="${e.id}">${esc(e.nombre)} (${e.categoria === 'Femenino' ? 'F' : 'M'})</option>`).join('')}</select>
      </label>
      <label class="campo"><span>Rival</span>
        <select id="cap-rival">${fem.slice(1).map(e => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('')}</select>
      </label>
      <p class="nota">En esta demo se registran las acciones de <b>tu</b> equipo (como en la planilla técnica). El marcador del rival se lleva con los botones de punto.</p>
      <button class="boton boton-primario boton-grande" onclick="vtIniciarCaptura()">🏐 Iniciar captura</button>
    </section>
    <section class="panel panel-estrecho">
      <h2>¿Cómo funciona?</h2>
      <ol class="lista-pasos">
        <li>Elegí la rotación actual (R1–R6) y, si querés, el jugador que ejecuta.</li>
        <li>Tocá la acción: ace, ataque en punto, error, recepción perfecta…</li>
        <li>El marcador y los porcentajes se actualizan solos; al final, guardás el partido y queda en el historial.</li>
      </ol>
    </section>`;
    const selEq = document.getElementById('cap-equipo');
    selEq.addEventListener('change', () => {
      const eq = D.equipo(selEq.value);
      const rivales = D.EQUIPOS.filter(e => e.categoria === eq.categoria && e.id !== eq.id);
      document.getElementById('cap-rival').innerHTML = rivales.map(e => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('');
    });
    return;
  }

  // -------- Captura activa --------
  const eq = D.equipo(captura.miEquipoId), rv = D.equipo(captura.rivalId);
  const set = captura.sets[captura.setActual];
  const evs = captura.eventos;

  // KPIs acumulados (todos los sets)
  const cuenta = id => evs.filter(e => e.accion === id).length;
  const saques = cuenta('saque_ace') + cuenta('saque_dentro') + cuenta('saque_error');
  const ataques = cuenta('ataque_punto') + cuenta('ataque_defendido') + cuenta('ataque_bloqueado') + cuenta('ataque_error');
  const kills = cuenta('ataque_punto');
  const recep = cuenta('recep_perfecta') + cuenta('recep_buena') + cuenta('recep_error');

  const porRot = ETI_ROT.map((_, i) => {
    const deRot = evs.filter(e => e.rot === i + 1);
    const atq = deRot.filter(e => e.accion.startsWith('ataque_')).length;
    const k = deRot.filter(e => e.accion === 'ataque_punto').length;
    const ptos = deRot.reduce((s, e) => s + ACCION_POR_ID[e.accion].delta[0], 0);
    return { rot: i + 1, ataques: atq, kills: k, puntos: ptos };
  });

  const ultimos = evs.slice(-6).reverse();

  $app().innerHTML = `
  <section class="panel captura-marcador" style="--c:${eq.color}">
    <div class="cm-meta">Captura en vivo · ${esc(eq.nombre)} vs ${esc(rv.nombre)} ·
      Sets previos: ${captura.sets.slice(0, captura.setActual).map(s => `${s.nos}-${s.ellos}`).join(' · ') || '—'}</div>
    <div class="cm-cuerpo">
      <div class="cm-lado">${escudo(eq, 'lg')}<span>${esc(eq.corto)}</span></div>
      <div class="cm-puntos"><b>${set.nos}</b><span class="cm-set">SET ${captura.setActual + 1}</span><b>${set.ellos}</b></div>
      <div class="cm-lado">${escudo(rv, 'lg')}<span>${esc(rv.corto)}</span></div>
    </div>
    <div class="cm-controles">
      <button class="boton boton-mini" onclick="vtDeshacer()" ${evs.length ? '' : 'disabled'}>↩ Deshacer</button>
      <button class="boton boton-mini" onclick="vtCerrarSet()">Cerrar set</button>
      <button class="boton boton-mini boton-ok" onclick="vtGuardarCaptura()">💾 Finalizar y guardar</button>
      <button class="boton boton-mini boton-peligro" onclick="vtDescartarCaptura()">✕ Descartar</button>
    </div>
  </section>

  <div class="captura-grid">
    <section class="panel">
      <h2>Registrar acción</h2>
      <div class="sel-rotacion">
        <span class="sr-eti">Rotación</span>
        ${ETI_ROT.map((r, i) => `<button class="chip-rot ${captura.rotacion === i + 1 ? 'activo' : ''}" onclick="vtRotacion(${i + 1})">${r}</button>`).join('')}
        <button class="chip-rot girar" onclick="vtRotacion(${(captura.rotacion % 6) + 1})" title="Rotar">⟳</button>
      </div>
      <div class="sel-jugador">
        <span class="sr-eti">Ejecuta</span>
        <button class="chip-jug ${captura.jugadorActivo === null ? 'activo' : ''}" onclick="vtJugador(null)">Equipo</button>
        ${plantillaDe(eq.id).map(j => `<button class="chip-jug ${captura.jugadorActivo === j.id ? 'activo' : ''}" onclick="vtJugador('${j.id}')" title="${esc(j.nombre)}">#${j.numero}</button>`).join('')}
      </div>
      ${ACCIONES.map(g => `
        <div class="grupo-acciones">
          <span class="ga-titulo">${g.grupo}</span>
          <div class="ga-botones">${g.items.map(a =>
            `<button class="boton-accion ${a.cl}" onclick="vtAccion('${a.id}')">${a.eti}</button>`).join('')}</div>
        </div>`).join('')}
      <div class="log-acciones">
        ${ultimos.map(e => {
          const a = ACCION_POR_ID[e.accion];
          const j = e.jugadorId ? buscarJugador(e.jugadorId) : null;
          return `<div class="log-item ${a.cl}">S${e.set + 1} · R${e.rot} · ${a.grupo}: ${a.eti}${j ? ` · #${j.numero}` : ''}</div>`;
        }).join('') || '<div class="log-item neutro">Sin acciones todavía. Tocá un botón para registrar la primera.</div>'}
      </div>
    </section>

    <section class="panel">
      <h2>Resumen en vivo</h2>
      <div class="grid-kpis grid-kpis-mini">
        <div class="kpi-caja"><b>${pct(cuenta('saque_ace'), saques)}</b><span>aces (${cuenta('saque_ace')}/${saques})</span></div>
        <div class="kpi-caja"><b>${pct(saques - cuenta('saque_error'), saques)}</b><span>saques exitosos</span></div>
        <div class="kpi-caja"><b>${pct(kills, ataques)}</b><span>ataques en punto (${kills}/${ataques})</span></div>
        <div class="kpi-caja"><b>${ataques ? Math.round(((kills - cuenta('ataque_error') - cuenta('ataque_bloqueado')) / ataques) * 100) + '%' : '—'}</b><span>eficiencia de ataque</span></div>
        <div class="kpi-caja"><b>${cuenta('bloqueo_punto')}</b><span>bloqueos punto</span></div>
        <div class="kpi-caja"><b>${pct(cuenta('recep_perfecta'), recep)}</b><span>recepción perfecta</span></div>
      </div>
      <h3 class="subtitulo">Por rotación</h3>
      <div class="tabla-envoltura"><table class="tabla tabla-mini">
        <thead><tr><th>Rot.</th><th>Ataques</th><th>Puntos atq.</th><th>Efect.</th><th>Pts. anotados</th></tr></thead>
        <tbody>${porRot.map(r => `<tr class="${captura.rotacion === r.rot ? 'fila-activa' : ''}">
          <td><b>R${r.rot}</b></td><td>${r.ataques}</td><td>${r.kills}</td><td>${pct(r.kills, r.ataques)}</td><td>${r.puntos}</td></tr>`).join('')}</tbody>
      </table></div>
      ${barrasRotacion(porRot, eq.color)}
    </section>
  </div>`;
}

function vtIniciarCaptura() {
  const miEquipoId = document.getElementById('cap-equipo').value;
  const rivalId = document.getElementById('cap-rival').value;
  if (!rivalId || rivalId === miEquipoId) { mostrarToast('Elegí un rival válido.'); return; }
  captura = {
    miEquipoId, rivalId,
    inicio: new Date().toISOString().slice(0, 16),
    sets: [{ nos: 0, ellos: 0 }],
    setActual: 0, rotacion: 1, jugadorActivo: null,
    eventos: [],
  };
  guardarCaptura();
  vistaCaptura();
}

function vtRotacion(r) { captura.rotacion = r; guardarCaptura(); vistaCaptura(); }
function vtJugador(id) { captura.jugadorActivo = id; guardarCaptura(); vistaCaptura(); }

function vtAccion(accionId) {
  const a = ACCION_POR_ID[accionId];
  const set = captura.sets[captura.setActual];
  set.nos += a.delta[0]; set.ellos += a.delta[1];
  captura.eventos.push({
    accion: accionId, set: captura.setActual, rot: captura.rotacion,
    jugadorId: captura.jugadorActivo, ts: Date.now(),
  });
  guardarCaptura();
  vistaCaptura();
}

function vtDeshacer() {
  const e = captura.eventos.pop();
  if (e) {
    const a = ACCION_POR_ID[e.accion];
    const set = captura.sets[e.set];
    if (set) { set.nos -= a.delta[0]; set.ellos -= a.delta[1]; }
  }
  guardarCaptura();
  vistaCaptura();
}

function vtCerrarSet() {
  const set = captura.sets[captura.setActual];
  if (set.nos === 0 && set.ellos === 0) { mostrarToast('El set está 0-0: registrá acciones primero.'); return; }
  captura.sets.push({ nos: 0, ellos: 0 });
  captura.setActual++;
  captura.rotacion = 1;
  guardarCaptura();
  mostrarToast(`Set ${captura.setActual} cerrado.`);
  vistaCaptura();
}

function vtDescartarCaptura() {
  if (!confirm('¿Descartar la captura actual? Se perderán las acciones registradas.')) return;
  captura = null;
  localStorage.removeItem('vt_captura');
  vistaCaptura();
}

function vtGuardarCaptura() {
  if (!captura.eventos.length) { mostrarToast('No hay acciones registradas todavía.'); return; }
  if (!confirm('¿Finalizar el partido y guardar las estadísticas?')) return;

  const evs = captura.eventos;
  const cuenta = id => evs.filter(e => e.accion === id).length;
  const sets = captura.sets.filter(s => s.nos > 0 || s.ellos > 0).map(s => [s.nos, s.ellos]);
  const setsNos = sets.filter(m => m[0] > m[1]).length;

  const porRotacion = ETI_ROT.map((_, i) => {
    const deRot = evs.filter(e => e.rot === i + 1);
    return {
      rot: i + 1,
      ataques: deRot.filter(e => e.accion.startsWith('ataque_')).length,
      kills: deRot.filter(e => e.accion === 'ataque_punto').length,
      puntos: deRot.reduce((s, e) => s + ACCION_POR_ID[e.accion].delta[0], 0),
    };
  });

  const partido = {
    id: `cap${Date.now()}`,
    torneo: 'Partido capturado con VolleyTool',
    categoria: D.equipo(captura.miEquipoId).categoria,
    fecha: captura.inicio,
    local: captura.miEquipoId, visita: captura.rivalId,
    sede: D.equipo(captura.miEquipoId).sede,
    estado: 'finalizado', capturado: true,
    sets: sets.length ? sets : [[0, 0]],
    ganador: setsNos >= sets.length - setsNos ? captura.miEquipoId : captura.rivalId,
    stats: {
      [captura.miEquipoId]: {
        saques: cuenta('saque_ace') + cuenta('saque_dentro') + cuenta('saque_error'),
        aces: cuenta('saque_ace'), errSaque: cuenta('saque_error'),
        ataques: cuenta('ataque_punto') + cuenta('ataque_defendido') + cuenta('ataque_bloqueado') + cuenta('ataque_error'),
        kills: cuenta('ataque_punto'), errAtaque: cuenta('ataque_error'),
        bloqueos: cuenta('bloqueo_punto'),
        recepTotal: cuenta('recep_perfecta') + cuenta('recep_buena') + cuenta('recep_error'),
        recepPerf: cuenta('recep_perfecta'),
        porRotacion,
      },
    },
  };

  guardarLS('vt_capturados', partidosCapturados().concat([partido]));
  captura = null;
  localStorage.removeItem('vt_captura');
  mostrarToast('Partido guardado en el historial. 🏐');
  location.hash = `#/partido/${partido.id}`;
}

/* ============================ MODALES Y FORMULARIOS ============================ */

function abrirModal(html) {
  const capa = document.getElementById('modal-capa');
  capa.querySelector('.modal').innerHTML = html;
  capa.hidden = false;
  document.body.style.overflow = 'hidden';
}
function cerrarModal() {
  document.getElementById('modal-capa').hidden = true;
  document.body.style.overflow = '';
}

function vtAbrirPlayer(partidoId) {
  const p = partidoPorId(partidoId);
  const eL = D.equipo(p.local), eV = D.equipo(p.visita);
  const esVivo = p.estado === 'envivo';
  abrirModal(`
    <button class="modal-cerrar" onclick="cerrarModal()" aria-label="Cerrar">✕</button>
    <div class="player player-modal">
      <div class="player-overlay">${esVivo ? `<span class="badge badge-vivo">● EN VIVO</span><span>👁 ${p.envivo.espectadores.toLocaleString('es-CR')}</span>` : `<span class="badge badge-suave">Grabación</span>`}</div>
      <button class="player-play" aria-label="Reproducir">▶</button>
      <div class="player-pie">${esc(eL.nombre)} vs ${esc(eV.nombre)}${p.video ? ` · ${p.video.duracion}` : ''}</div>
    </div>
    <p class="nota nota-modal">🎬 Reproductor simulado para la demo. En la versión completa aquí se vería la transmisión o grabación real, transmitida desde el teléfono o cámara del equipo.</p>
    <div class="hero-acciones">
      ${p.estado === 'finalizado' ? `<a class="boton boton-primario" href="#/partido/${p.id}" onclick="cerrarModal()">📊 Ver estadísticas del partido</a>` : ''}
      ${esVivo ? `<a class="boton boton-primario" href="#/captura" onclick="cerrarModal()">📋 Capturar estadísticas</a>` : ''}
    </div>`);
}

function vtAbrirPlayerExtra(videoId) {
  const v = D.VIDEOS_EXTRA.find(x => x.id === videoId);
  abrirModal(`
    <button class="modal-cerrar" onclick="cerrarModal()" aria-label="Cerrar">✕</button>
    <div class="player player-modal">
      <div class="player-overlay"><span class="badge badge-suave">${esc(v.tipo)}</span></div>
      <button class="player-play" aria-label="Reproducir">▶</button>
      <div class="player-pie">${esc(v.titulo)} · ${v.duracion}</div>
    </div>
    <p class="nota nota-modal">🎬 Reproductor simulado para la demo.</p>`);
}

function vtFormJugador(equipoId) {
  const e = D.equipo(equipoId);
  abrirModal(`
    <button class="modal-cerrar" onclick="cerrarModal()" aria-label="Cerrar">✕</button>
    <h2>Registrar jugador · ${esc(e.nombre)}</h2>
    <p class="nota">Así centraliza cada club la información de su plantilla. Los campos marcados con * son obligatorios.</p>
    <form class="form-jugador" onsubmit="vtGuardarJugador(event, '${equipoId}')">
      <label class="campo c2"><span>Nombre completo *</span><input id="fj-nombre" required maxlength="60" placeholder="Ej.: Ana Lucía Vargas Mora"></label>
      <label class="campo"><span>Cédula *</span><input id="fj-cedula" required maxlength="12" placeholder="1-2345-0678"></label>
      <label class="campo"><span>Fecha de nacimiento *</span><input id="fj-nac" type="date" required min="1980-01-01" max="2014-12-31"></label>
      <label class="campo"><span>Tipo de sangre</span>
        <select id="fj-sangre">${['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => `<option>${t}</option>`).join('')}</select></label>
      <label class="campo"><span>Lateralidad</span>
        <select id="fj-lat"><option>Derecho(a)</option><option>Zurdo(a)</option><option>Ambidiestro(a)</option></select></label>
      <label class="campo"><span>Posición *</span>
        <select id="fj-pos">${Object.keys({ 'Armador(a)': 1, 'Opuesto(a)': 1, 'Central': 1, 'Punta': 1, 'Líbero': 1 }).map(p => `<option>${p}</option>`).join('')}</select></label>
      <label class="campo"><span>Número de camiseta *</span><input id="fj-num" type="number" required min="1" max="99" placeholder="10"></label>
      <label class="campo"><span>Altura (cm) *</span><input id="fj-altura" type="number" required min="140" max="225" placeholder="178"></label>
      <label class="campo"><span>Peso (kg) *</span><input id="fj-peso" type="number" required min="40" max="140" placeholder="70"></label>
      <label class="campo"><span>Salto vertical (cm)</span><input id="fj-salto" type="number" min="10" max="120" placeholder="Se medirá con Spike Performance"></label>
      <div class="c2 form-acciones">
        <button type="button" class="boton" onclick="cerrarModal()">Cancelar</button>
        <button type="submit" class="boton boton-primario">Guardar jugador</button>
      </div>
    </form>`);
}

function vtGuardarJugador(ev, equipoId) {
  ev.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  const numero = parseInt(v('fj-num'), 10);
  if (plantillaDe(equipoId).some(j => j.numero === numero)) {
    mostrarToast(`El número ${numero} ya está ocupado en este equipo.`);
    return;
  }
  const salto = v('fj-salto') ? parseInt(v('fj-salto'), 10) : null;
  const altura = parseInt(v('fj-altura'), 10);
  const nuevo = {
    id: `extra-${Date.now()}`,
    equipoId, extra: true,
    nombre: v('fj-nombre'), cedula: v('fj-cedula'),
    fechaNacimiento: v('fj-nac'), tipoSangre: v('fj-sangre'),
    alturaCm: altura, pesoKg: parseInt(v('fj-peso'), 10),
    lateralidad: v('fj-lat'), posicion: v('fj-pos'),
    numero, capitan: false, nacionalidad: 'Costa Rica',
    fisico: {
      saltoVerticalCm: salto,
      alcanceAtaqueCm: salto ? Math.round(altura * 1.31) + salto + 4 : null,
      alcanceBloqueoCm: salto ? Math.round(altura * 1.31) + Math.round(salto * 0.82) : null,
      ultimaMedicion: salto ? new Date().toISOString().slice(0, 10) : null,
      fuente: 'Registro manual',
    },
    stats: { setsJugados: 0, puntos: 0, kills: 0, ataques: 0, errAtaque: 0, aces: 0, errSaque: 0, bloqueos: 0, recepTotal: 0, recepPerf: 0, digs: 0, asistencias: 0 },
    radar: null,
  };
  guardarLS('vt_jugadores_extra', jugadoresExtra().concat([nuevo]));
  cerrarModal();
  mostrarToast(`${nuevo.nombre} quedó registrado en ${D.equipo(equipoId).nombre}. ✅`);
  location.hash = `#/equipo/${equipoId}/plantilla`;
  enrutar();
}

/* ============================ TOAST ============================ */

let toastTimer = null;
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('visible'); t.hidden = true; }, 3200);
}

/* ============================ RESET DEMO ============================ */

function vtReiniciarDemo() {
  if (!confirm('¿Restablecer la demo? Se borrarán los jugadores y partidos que registraste.')) return;
  localStorage.removeItem('vt_captura');
  localStorage.removeItem('vt_capturados');
  localStorage.removeItem('vt_jugadores_extra');
  captura = null;
  mostrarToast('Demo restablecida.');
  location.hash = '#/inicio';
  enrutar();
}

/* ============================ VISTA 404 ============================ */

function vista404() {
  $app().innerHTML = `
  <section class="panel panel-centro">
    <h1>🏐 Fuera de la cancha</h1>
    <p class="nota">No encontramos esa página.</p>
    <a class="boton boton-primario" href="#/inicio">Volver al inicio</a>
  </section>`;
}

/* ============================ ENRUTADOR ============================ */

function enrutar() {
  const hash = location.hash || '#/inicio';
  const partes = hash.replace(/^#\//, '').split('/').map(decodeURIComponent);
  const [ruta, p1, p2] = partes;

  // Resaltar enlace activo en el nav
  document.querySelectorAll('nav.principal a').forEach(a => {
    a.classList.toggle('activo', a.getAttribute('href') === `#/${ruta}`);
  });

  switch (ruta) {
    case '':
    case 'inicio':    vistaInicio(); break;
    case 'equipos':   vistaEquipos(p1 || 'Todos'); break;
    case 'equipo':    vistaEquipo(p1, p2 || 'plantilla'); break;
    case 'jugador':   vistaJugador(p1); break;
    case 'partidos':  vistaPartidos(p1 || 'Todos'); break;
    case 'partido':   vistaPartido(p1); break;
    case 'captura':   vistaCaptura(); break;
    case 'videos':    vistaVideos(); break;
    case 'scouting':  vistaScouting(p1, p2); break;
    case 'comunidad': vistaComunidad(); break;
    default:          vista404();
  }
  window.scrollTo({ top: 0 });
}

window.addEventListener('hashchange', enrutar);
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal-capa').addEventListener('click', ev => {
    if (ev.target.id === 'modal-capa') cerrarModal();
  });
  enrutar();
});
