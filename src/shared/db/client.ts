import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env.js';

// postgres.js es perezoso: no abre la conexión hasta la primera consulta,
// así que importar este módulo no requiere que la base esté levantada.
const client = postgres(env.DATABASE_URL);

// Cliente Drizzle compartido por los repos de todos los dominios.
// Un solo pool de conexiones; los esquemas se definen por dominio.
export const db = drizzle(client);

export { client };
