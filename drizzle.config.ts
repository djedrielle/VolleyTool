import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Por ahora el esquema real lo crea el script SQL de
// src/Metrics/Data/db_scripts/001_crear_esquema_metrics.sql.
// Esta config habilita drizzle-kit (p. ej. `drizzle-kit studio`) y, a
// futuro, generar migraciones desde las definiciones TS de cada dominio.
export default defineConfig({
  schema: './src/*/Data/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgres://volleytool:volleytool_dev@localhost:5432/volleytool',
  },
});
