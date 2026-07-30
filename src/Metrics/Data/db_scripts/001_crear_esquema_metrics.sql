/* ============================================================
   VolleyTool CR — Esquema del dominio Metrics
   ------------------------------------------------------------
   PostgreSQL 13 o superior (usa gen_random_uuid() nativo).

   El dominio vive en su propio esquema. Streaming y On-demand
   tendran el suyo: sin llaves foraneas ni joins entre esquemas,
   cada dominio se comunica con los otros por su servicio.

   Orden de lectura:
     1. Catalogo      — quien es quien
     2. Inscripcion   — quien juega con quien, en que torneo
     3. Competencia   — torneos, partidos, sets, alineaciones
     4. Fuente de verdad — accion (solo se anexa)
     5. Agregados     — los calcula el proyector
     6. Vistas        — torneo y overall, sumados sobre partido

   Para crear la base primero (fuera de este script):
     CREATE DATABASE volleytool;
   ============================================================ */

BEGIN;

CREATE SCHEMA IF NOT EXISTS metrics;

SET LOCAL search_path TO metrics, public;


/* ============================ TIPOS ============================ */

CREATE TYPE metrics.categoria AS ENUM ('femenino', 'masculino');

CREATE TYPE metrics.condicion AS ENUM ('casa', 'visita');

CREATE TYPE metrics.estado_partido AS ENUM ('programado', 'en_vivo', 'finalizado', 'suspendido');

CREATE TYPE metrics.posicion AS ENUM ('armador', 'opuesto', 'central', 'punta', 'libero');

CREATE TYPE metrics.lateralidad AS ENUM ('derecha', 'izquierda', 'ambidiestro');

CREATE TYPE metrics.tipo_accion AS ENUM (
  'saque', 'recepcion', 'colocacion', 'ataque', 'bloqueo', 'defensa'
);

/* Un solo conjunto de resultados; que valores son validos depende
   del tipo de accion y se valida con un CHECK en la tabla accion. */
CREATE TYPE metrics.resultado_accion AS ENUM (
  'ace', 'recibido',
  'perfecta', 'fuera_sistema',
  'ok',
  'punto_directo', 'defendido',
  'exitosa',
  'error'
);


/* ============================ 1. CATALOGO ============================ */

CREATE TABLE metrics.equipo (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL UNIQUE,
  corto           text NOT NULL,
  categoria       metrics.categoria NOT NULL,
  provincia       text,
  sede            text,
  color           text,
  fundado         smallint,
  creado_en       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT corto_longitud CHECK (char_length(corto) BETWEEN 2 AND 4)
);

CREATE TABLE metrics.jugador (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            text NOT NULL,
  apellido1         text NOT NULL,
  apellido2         text,
  cedula            text UNIQUE,
  fecha_nacimiento  date NOT NULL,
  nacionalidad      text NOT NULL DEFAULT 'Costa Rica',
  tipo_sangre       text,
  lateralidad       metrics.lateralidad,
  altura_cm         smallint CHECK (altura_cm BETWEEN 120 AND 250),
  peso_kg           smallint CHECK (peso_kg BETWEEN 30 AND 200),
  creado_en         timestamptz NOT NULL DEFAULT now()
);

/* Sin numero, sin posicion y sin equipo: eso pertenece a la
   inscripcion en un torneo, no a la persona. */

CREATE TABLE metrics.cuerpo_tecnico (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text NOT NULL,
  apellido1     text NOT NULL,
  apellido2     text,
  nacionalidad  text NOT NULL DEFAULT 'Costa Rica',
  creado_en     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE metrics.torneo (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text NOT NULL,
  temporada     smallint NOT NULL,
  categoria     metrics.categoria NOT NULL,
  fecha_inicio  date,
  fecha_fin     date,
  formato       text,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nombre, temporada, categoria),
  CONSTRAINT fechas_coherentes CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);


/* ============================ 2. INSCRIPCION ============================ */

/* Resuelve los traspasos: un jugador puede estar en equipos
   distintos en torneos distintos, y sus estadisticas historicas
   quedan atribuidas al equipo con el que las hizo. */
CREATE TABLE metrics.plantilla (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jugador_id  uuid NOT NULL REFERENCES metrics.jugador(id) ON DELETE RESTRICT,
  equipo_id   uuid NOT NULL REFERENCES metrics.equipo(id)  ON DELETE RESTRICT,
  torneo_id   uuid NOT NULL REFERENCES metrics.torneo(id)  ON DELETE RESTRICT,
  numero      smallint NOT NULL CHECK (numero BETWEEN 1 AND 99),
  posicion    metrics.posicion NOT NULL,
  es_capitan  boolean NOT NULL DEFAULT false,
  desde       date,
  hasta       date,
  UNIQUE (equipo_id, torneo_id, numero),
  CONSTRAINT vigencia_coherente CHECK (hasta IS NULL OR desde IS NULL OR hasta >= desde)
);

CREATE TABLE metrics.plantilla_tecnico (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuerpo_tecnico_id  uuid NOT NULL REFERENCES metrics.cuerpo_tecnico(id) ON DELETE RESTRICT,
  equipo_id          uuid NOT NULL REFERENCES metrics.equipo(id)         ON DELETE RESTRICT,
  torneo_id          uuid NOT NULL REFERENCES metrics.torneo(id)         ON DELETE RESTRICT,
  rol                text NOT NULL,
  UNIQUE (cuerpo_tecnico_id, equipo_id, torneo_id)
);

/* Mediciones fisicas externas. Las columnas de metricas quedan
   pendientes de definir; por ahora solo la estructura que las
   ancla al jugador y a una fecha. */
CREATE TABLE metrics.medicion_spike (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jugador_id      uuid NOT NULL REFERENCES metrics.jugador(id) ON DELETE CASCADE,
  fecha_medicion  date NOT NULL,
  fuente          text NOT NULL DEFAULT 'Spike Performance',
  registrado_en   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (jugador_id, fecha_medicion, fuente)
);


/* ============================ 3. COMPETENCIA ============================ */

CREATE TABLE metrics.partido (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  torneo_id    uuid NOT NULL REFERENCES metrics.torneo(id) ON DELETE RESTRICT,
  jornada      smallint,
  fecha_hora   timestamptz NOT NULL,
  sede         text,
  estado       metrics.estado_partido NOT NULL DEFAULT 'programado',
  creado_en    timestamptz NOT NULL DEFAULT now()
);

/* Sin ganador ni perdedor: se derivan de los sets. */

CREATE TABLE metrics.partido_equipo (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id  uuid NOT NULL REFERENCES metrics.partido(id) ON DELETE CASCADE,
  equipo_id   uuid NOT NULL REFERENCES metrics.equipo(id)  ON DELETE RESTRICT,
  condicion   metrics.condicion NOT NULL,
  UNIQUE (partido_id, condicion),
  UNIQUE (partido_id, equipo_id)
);

/* "set" es palabra reservada en SQL, por eso set_partido. */
CREATE TABLE metrics.set_partido (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id     uuid NOT NULL REFERENCES metrics.partido(id) ON DELETE CASCADE,
  numero         smallint NOT NULL CHECK (numero BETWEEN 1 AND 5),
  puntos_casa    smallint NOT NULL DEFAULT 0 CHECK (puntos_casa   >= 0),
  puntos_visita  smallint NOT NULL DEFAULT 0 CHECK (puntos_visita >= 0),
  cerrado        boolean NOT NULL DEFAULT false,
  UNIQUE (partido_id, numero)
);

/* Quien estaba en cancha y en que rotacion arranco.
   Sin esto, el campo rotacion de las acciones no es verificable. */
CREATE TABLE metrics.alineacion (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id            uuid NOT NULL REFERENCES metrics.set_partido(id) ON DELETE CASCADE,
  equipo_id         uuid NOT NULL REFERENCES metrics.equipo(id)      ON DELETE RESTRICT,
  jugador_id        uuid NOT NULL REFERENCES metrics.jugador(id)     ON DELETE RESTRICT,
  rotacion_inicial  smallint CHECK (rotacion_inicial BETWEEN 1 AND 6),
  es_libero         boolean NOT NULL DEFAULT false,
  entra_en_rally    smallint,
  sale_en_rally     smallint,
  UNIQUE (set_id, jugador_id),
  CONSTRAINT libero_sin_rotacion CHECK (
    (es_libero AND rotacion_inicial IS NULL) OR (NOT es_libero)
  )
);


/* ============================ 4. FUENTE DE VERDAD ============================ */

/* Tabla de solo anexar. Nunca UPDATE, nunca DELETE.
   Para corregir se anexa otra fila apuntando a la que corrige.
   El trigger de mas abajo lo hace cumplir.

   punto_para_equipo_id nulo  = el rally sigue
   punto_para_equipo_id lleno = esta accion cerro el rally, y el
                                punto fue para ese equipo (que no
                                siempre es el equipo de la accion:
                                un ataque errado da el punto al rival). */
CREATE TABLE metrics.accion (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id                uuid NOT NULL REFERENCES metrics.set_partido(id) ON DELETE RESTRICT,
  equipo_id             uuid NOT NULL REFERENCES metrics.equipo(id)      ON DELETE RESTRICT,
  jugador_id            uuid NOT NULL REFERENCES metrics.jugador(id)     ON DELETE RESTRICT,
  rally                 smallint NOT NULL CHECK (rally > 0),
  orden_en_rally        smallint NOT NULL CHECK (orden_en_rally > 0),
  rotacion              smallint NOT NULL CHECK (rotacion BETWEEN 1 AND 6),
  tipo                  metrics.tipo_accion NOT NULL,
  resultado             metrics.resultado_accion NOT NULL,
  punto_para_equipo_id  uuid REFERENCES metrics.equipo(id) ON DELETE RESTRICT,
  corrige_accion_id     uuid UNIQUE REFERENCES metrics.accion(id) ON DELETE RESTRICT,
  registrado_en         timestamptz NOT NULL DEFAULT now(),
  registrado_por        uuid,
  CONSTRAINT resultado_valido_para_tipo CHECK (
    (tipo = 'saque'      AND resultado IN ('ace', 'recibido', 'error'))      OR
    (tipo = 'recepcion'  AND resultado IN ('perfecta', 'fuera_sistema', 'error')) OR
    (tipo = 'colocacion' AND resultado IN ('ok', 'error'))                   OR
    (tipo = 'ataque'     AND resultado IN ('punto_directo', 'defendido', 'error')) OR
    (tipo = 'bloqueo'    AND resultado IN ('punto_directo', 'defendido', 'error')) OR
    (tipo = 'defensa'    AND resultado IN ('exitosa', 'error'))
  ),
  CONSTRAINT no_se_corrige_a_si_misma CHECK (corrige_accion_id IS DISTINCT FROM id)
);

/* Solo las acciones vigentes ocupan una posicion en el rally;
   las correcciones repiten rally y orden a proposito. */
CREATE UNIQUE INDEX accion_posicion_unica
  ON metrics.accion (set_id, rally, orden_en_rally)
  WHERE corrige_accion_id IS NULL;


/* ============================ 5. AGREGADOS ============================ */

/* Los calcula el proyector al cerrar el set o el partido.
   Son desechables: si se borran, se reconstruyen desde accion.
   Sin id propio: la combinacion de llaves ya los identifica. */

CREATE TABLE metrics.metricas_jugador_partido (
  jugador_id                 uuid NOT NULL REFERENCES metrics.jugador(id) ON DELETE CASCADE,
  partido_id                 uuid NOT NULL REFERENCES metrics.partido(id) ON DELETE CASCADE,
  equipo_id                  uuid NOT NULL REFERENCES metrics.equipo(id)  ON DELETE RESTRICT,
  sets_jugados               smallint NOT NULL DEFAULT 0,
  ataques_totales            integer NOT NULL DEFAULT 0,
  ataques_punto_directo      integer NOT NULL DEFAULT 0,
  ataques_defendidos         integer NOT NULL DEFAULT 0,
  ataques_errados            integer NOT NULL DEFAULT 0,
  bloqueos_totales           integer NOT NULL DEFAULT 0,
  bloqueos_punto_directo     integer NOT NULL DEFAULT 0,
  bloqueos_defendidos        integer NOT NULL DEFAULT 0,
  bloqueos_errados           integer NOT NULL DEFAULT 0,
  saques_totales             integer NOT NULL DEFAULT 0,
  aces                       integer NOT NULL DEFAULT 0,
  saques_recibidos           integer NOT NULL DEFAULT 0,
  saques_errados             integer NOT NULL DEFAULT 0,
  defensas_totales           integer NOT NULL DEFAULT 0,
  defensas_exitosas          integer NOT NULL DEFAULT 0,
  recepciones_totales        integer NOT NULL DEFAULT 0,
  recepciones_perfectas      integer NOT NULL DEFAULT 0,
  recepciones_fuera_sistema  integer NOT NULL DEFAULT 0,
  recepciones_erradas        integer NOT NULL DEFAULT 0,
  calculado_en               timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (jugador_id, partido_id)
);

CREATE TABLE metrics.metricas_equipo_partido (
  equipo_id                  uuid NOT NULL REFERENCES metrics.equipo(id)  ON DELETE CASCADE,
  partido_id                 uuid NOT NULL REFERENCES metrics.partido(id) ON DELETE CASCADE,
  ataques_totales            integer NOT NULL DEFAULT 0,
  ataques_punto_directo      integer NOT NULL DEFAULT 0,
  ataques_defendidos         integer NOT NULL DEFAULT 0,
  ataques_errados            integer NOT NULL DEFAULT 0,
  bloqueos_totales           integer NOT NULL DEFAULT 0,
  bloqueos_punto_directo     integer NOT NULL DEFAULT 0,
  bloqueos_defendidos        integer NOT NULL DEFAULT 0,
  bloqueos_errados           integer NOT NULL DEFAULT 0,
  saques_totales             integer NOT NULL DEFAULT 0,
  aces                       integer NOT NULL DEFAULT 0,
  saques_recibidos           integer NOT NULL DEFAULT 0,
  saques_errados             integer NOT NULL DEFAULT 0,
  defensas_totales           integer NOT NULL DEFAULT 0,
  defensas_exitosas          integer NOT NULL DEFAULT 0,
  recepciones_totales        integer NOT NULL DEFAULT 0,
  recepciones_perfectas      integer NOT NULL DEFAULT 0,
  recepciones_fuera_sistema  integer NOT NULL DEFAULT 0,
  recepciones_erradas        integer NOT NULL DEFAULT 0,
  calculado_en               timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (equipo_id, partido_id)
);

/* Efectividad de ataque por rotacion: el diferenciador del producto. */
CREATE TABLE metrics.metricas_rotacion (
  equipo_id       uuid NOT NULL REFERENCES metrics.equipo(id)  ON DELETE CASCADE,
  partido_id      uuid NOT NULL REFERENCES metrics.partido(id) ON DELETE CASCADE,
  rotacion        smallint NOT NULL CHECK (rotacion BETWEEN 1 AND 6),
  ataques         integer NOT NULL DEFAULT 0,
  puntos_directos integer NOT NULL DEFAULT 0,
  puntos_totales  integer NOT NULL DEFAULT 0,
  calculado_en    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (equipo_id, partido_id, rotacion)
);

/* Tabla de posiciones. Puntuacion FIVB: 3-0 y 3-1 dan 3 puntos;
   3-2 da 2 al ganador y 1 al perdedor. */
CREATE TABLE metrics.clasificacion (
  torneo_id     uuid NOT NULL REFERENCES metrics.torneo(id) ON DELETE CASCADE,
  equipo_id     uuid NOT NULL REFERENCES metrics.equipo(id) ON DELETE CASCADE,
  pj            smallint NOT NULL DEFAULT 0,
  pg            smallint NOT NULL DEFAULT 0,
  pp            smallint NOT NULL DEFAULT 0,
  sets_favor    smallint NOT NULL DEFAULT 0,
  sets_contra   smallint NOT NULL DEFAULT 0,
  puntos        smallint NOT NULL DEFAULT 0,
  calculado_en  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (torneo_id, equipo_id)
);


/* ============================ 6. VISTAS ============================ */

/* Torneo y overall no se almacenan: son sumas sobre el grano de
   partido. Un solo lugar donde corregir, cero riesgo de que se
   desincronicen. Si algun dia pesan, se vuelven materializadas
   sin tocar la aplicacion. */

CREATE VIEW metrics.metricas_jugador_torneo AS
SELECT
  m.jugador_id,
  p.torneo_id,
  m.equipo_id,
  count(*)::integer                      AS partidos_jugados,
  sum(m.sets_jugados)::integer           AS sets_jugados,
  sum(m.ataques_totales)::integer        AS ataques_totales,
  sum(m.ataques_punto_directo)::integer  AS ataques_punto_directo,
  sum(m.ataques_defendidos)::integer     AS ataques_defendidos,
  sum(m.ataques_errados)::integer        AS ataques_errados,
  sum(m.bloqueos_totales)::integer       AS bloqueos_totales,
  sum(m.bloqueos_punto_directo)::integer AS bloqueos_punto_directo,
  sum(m.bloqueos_defendidos)::integer    AS bloqueos_defendidos,
  sum(m.bloqueos_errados)::integer       AS bloqueos_errados,
  sum(m.saques_totales)::integer         AS saques_totales,
  sum(m.aces)::integer                   AS aces,
  sum(m.saques_recibidos)::integer       AS saques_recibidos,
  sum(m.saques_errados)::integer         AS saques_errados,
  sum(m.defensas_totales)::integer       AS defensas_totales,
  sum(m.defensas_exitosas)::integer      AS defensas_exitosas,
  sum(m.recepciones_totales)::integer    AS recepciones_totales,
  sum(m.recepciones_perfectas)::integer  AS recepciones_perfectas,
  sum(m.recepciones_fuera_sistema)::integer AS recepciones_fuera_sistema,
  sum(m.recepciones_erradas)::integer    AS recepciones_erradas
FROM metrics.metricas_jugador_partido m
JOIN metrics.partido p ON p.id = m.partido_id
GROUP BY m.jugador_id, p.torneo_id, m.equipo_id;

CREATE VIEW metrics.metricas_jugador_overall AS
SELECT
  m.jugador_id,
  count(*)::integer                      AS partidos_jugados,
  sum(m.sets_jugados)::integer           AS sets_jugados,
  sum(m.ataques_totales)::integer        AS ataques_totales,
  sum(m.ataques_punto_directo)::integer  AS ataques_punto_directo,
  sum(m.ataques_defendidos)::integer     AS ataques_defendidos,
  sum(m.ataques_errados)::integer        AS ataques_errados,
  sum(m.bloqueos_totales)::integer       AS bloqueos_totales,
  sum(m.bloqueos_punto_directo)::integer AS bloqueos_punto_directo,
  sum(m.bloqueos_defendidos)::integer    AS bloqueos_defendidos,
  sum(m.bloqueos_errados)::integer       AS bloqueos_errados,
  sum(m.saques_totales)::integer         AS saques_totales,
  sum(m.aces)::integer                   AS aces,
  sum(m.saques_recibidos)::integer       AS saques_recibidos,
  sum(m.saques_errados)::integer         AS saques_errados,
  sum(m.defensas_totales)::integer       AS defensas_totales,
  sum(m.defensas_exitosas)::integer      AS defensas_exitosas,
  sum(m.recepciones_totales)::integer    AS recepciones_totales,
  sum(m.recepciones_perfectas)::integer  AS recepciones_perfectas,
  sum(m.recepciones_fuera_sistema)::integer AS recepciones_fuera_sistema,
  sum(m.recepciones_erradas)::integer    AS recepciones_erradas
FROM metrics.metricas_jugador_partido m
GROUP BY m.jugador_id;

CREATE VIEW metrics.metricas_equipo_torneo AS
SELECT
  m.equipo_id,
  p.torneo_id,
  count(*)::integer                      AS partidos_jugados,
  sum(m.ataques_totales)::integer        AS ataques_totales,
  sum(m.ataques_punto_directo)::integer  AS ataques_punto_directo,
  sum(m.ataques_defendidos)::integer     AS ataques_defendidos,
  sum(m.ataques_errados)::integer        AS ataques_errados,
  sum(m.bloqueos_totales)::integer       AS bloqueos_totales,
  sum(m.bloqueos_punto_directo)::integer AS bloqueos_punto_directo,
  sum(m.bloqueos_defendidos)::integer    AS bloqueos_defendidos,
  sum(m.bloqueos_errados)::integer       AS bloqueos_errados,
  sum(m.saques_totales)::integer         AS saques_totales,
  sum(m.aces)::integer                   AS aces,
  sum(m.saques_recibidos)::integer       AS saques_recibidos,
  sum(m.saques_errados)::integer         AS saques_errados,
  sum(m.defensas_totales)::integer       AS defensas_totales,
  sum(m.defensas_exitosas)::integer      AS defensas_exitosas,
  sum(m.recepciones_totales)::integer    AS recepciones_totales,
  sum(m.recepciones_perfectas)::integer  AS recepciones_perfectas,
  sum(m.recepciones_fuera_sistema)::integer AS recepciones_fuera_sistema,
  sum(m.recepciones_erradas)::integer    AS recepciones_erradas
FROM metrics.metricas_equipo_partido m
JOIN metrics.partido p ON p.id = m.partido_id
GROUP BY m.equipo_id, p.torneo_id;

CREATE VIEW metrics.metricas_equipo_overall AS
SELECT
  m.equipo_id,
  count(*)::integer                      AS partidos_jugados,
  sum(m.ataques_totales)::integer        AS ataques_totales,
  sum(m.ataques_punto_directo)::integer  AS ataques_punto_directo,
  sum(m.ataques_defendidos)::integer     AS ataques_defendidos,
  sum(m.ataques_errados)::integer        AS ataques_errados,
  sum(m.bloqueos_totales)::integer       AS bloqueos_totales,
  sum(m.bloqueos_punto_directo)::integer AS bloqueos_punto_directo,
  sum(m.bloqueos_defendidos)::integer    AS bloqueos_defendidos,
  sum(m.bloqueos_errados)::integer       AS bloqueos_errados,
  sum(m.saques_totales)::integer         AS saques_totales,
  sum(m.aces)::integer                   AS aces,
  sum(m.saques_recibidos)::integer       AS saques_recibidos,
  sum(m.saques_errados)::integer         AS saques_errados,
  sum(m.defensas_totales)::integer       AS defensas_totales,
  sum(m.defensas_exitosas)::integer      AS defensas_exitosas,
  sum(m.recepciones_totales)::integer    AS recepciones_totales,
  sum(m.recepciones_perfectas)::integer  AS recepciones_perfectas,
  sum(m.recepciones_fuera_sistema)::integer AS recepciones_fuera_sistema,
  sum(m.recepciones_erradas)::integer    AS recepciones_erradas
FROM metrics.metricas_equipo_partido m
GROUP BY m.equipo_id;


/* ============================ REGLAS ============================ */

/* accion es de solo anexar. Este trigger lo hace cumplir a nivel
   de base, no solo por disciplina del codigo. */
CREATE OR REPLACE FUNCTION metrics.impedir_modificacion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'metrics.% es de solo anexar: % no esta permitido. Para corregir, inserte una fila nueva con corrige_accion_id.',
    TG_TABLE_NAME, TG_OP;
END;
$$;

CREATE TRIGGER accion_solo_anexar
  BEFORE UPDATE OR DELETE ON metrics.accion
  FOR EACH ROW EXECUTE FUNCTION metrics.impedir_modificacion();

/* Un partido tiene exactamente dos equipos. Diferido: se valida
   al confirmar la transaccion, para poder insertar el partido y
   sus dos filas juntos. */
CREATE OR REPLACE FUNCTION metrics.validar_dos_equipos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_partido uuid;
  v_total   integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_partido := OLD.partido_id;
  ELSE
    v_partido := NEW.partido_id;
  END IF;

  /* Si el partido ya no existe, el borrado en cascada hizo su
     trabajo y no hay nada que validar. */
  IF NOT EXISTS (SELECT 1 FROM metrics.partido WHERE id = v_partido) THEN
    RETURN NULL;
  END IF;

  SELECT count(*) INTO v_total
    FROM metrics.partido_equipo
   WHERE partido_id = v_partido;

  IF v_total <> 2 THEN
    RAISE EXCEPTION 'El partido % debe tener exactamente 2 equipos (tiene %).', v_partido, v_total;
  END IF;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER partido_equipo_exactamente_dos
  AFTER INSERT OR UPDATE OR DELETE ON metrics.partido_equipo
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION metrics.validar_dos_equipos();


/* ============================ INDICES ============================ */

CREATE INDEX accion_set_idx        ON metrics.accion (set_id);
CREATE INDEX accion_jugador_idx    ON metrics.accion (jugador_id);
CREATE INDEX accion_equipo_idx     ON metrics.accion (equipo_id);
CREATE INDEX accion_rally_idx      ON metrics.accion (set_id, rally, orden_en_rally);

CREATE INDEX partido_equipo_equipo_idx ON metrics.partido_equipo (equipo_id);
CREATE INDEX partido_torneo_idx        ON metrics.partido (torneo_id);
CREATE INDEX partido_fecha_idx         ON metrics.partido (fecha_hora);
CREATE INDEX set_partido_idx           ON metrics.set_partido (partido_id);

CREATE INDEX plantilla_jugador_idx  ON metrics.plantilla (jugador_id);
CREATE INDEX plantilla_equipo_idx   ON metrics.plantilla (equipo_id, torneo_id);
CREATE INDEX alineacion_set_idx     ON metrics.alineacion (set_id);
CREATE INDEX medicion_jugador_idx   ON metrics.medicion_spike (jugador_id, fecha_medicion DESC);

CREATE INDEX mjp_partido_idx ON metrics.metricas_jugador_partido (partido_id);
CREATE INDEX mep_partido_idx ON metrics.metricas_equipo_partido (partido_id);

COMMIT;
