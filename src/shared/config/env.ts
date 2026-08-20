import 'dotenv/config';

// Valor por defecto pensado para desarrollo local: coincide con las
// credenciales del docker-compose en src/Metrics/Data/db_scripts, para
// que `npm run dev` funcione sin necesidad de crear un .env.
const DEFAULT_DATABASE_URL =
  'postgres://volleytool:volleytool_dev@localhost:5432/volleytool';

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  // Secreto para firmar los JWT del login. En producción SIEMPRE se
  // define por entorno; el default es solo para desarrollo local.
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-cambiar-en-produccion',
};
