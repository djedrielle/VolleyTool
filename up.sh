#!/bin/bash
set -e

# Raíz del repo = carpeta donde está este script (funciona desde donde sea).
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Al salir (incluido Ctrl+C), bajar todo lo que quede en segundo plano.
trap 'kill 0' EXIT

# 1. Base de datos — detached (-d retorna de una). El compose NO está en la raíz.
docker compose -f "$ROOT/src/Metrics/Data/db_scripts/docker-compose.yml" up -d

# 2. Backend en segundo plano (:3000). El & es lo que evita que se quede pegado acá.
( cd "$ROOT" && npm run dev ) &

# 3. Frontend en primer plano (:5173) — mantiene vivo el script.
cd "$ROOT/front" && npm run dev

# Para bajar la base
# docker compose -f src/Metrics/Data/db_scripts/docker-compose.yml down