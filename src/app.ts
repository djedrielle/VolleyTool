import Fastify, { type FastifyInstance } from 'fastify';
import { autenticar } from './shared/http/auth.js';
import { ErrorValidacion, NoEncontrado } from './shared/errors.js';
import { registrarCore } from './Core/index.js';

// postgres.js expone el SQLSTATE en `.code`, pero Drizzle envuelve el
// error del driver y lo deja en `.cause`. Recorremos la cadena de causas
// para encontrar el código (5 dígitos) sin importar cómo venga envuelto.
function codigoSqlState(err: unknown): string | undefined {
  let actual: unknown = err;
  for (let i = 0; i < 5 && actual != null; i++) {
    const code = (actual as { code?: unknown }).code;
    if (typeof code === 'string' && /^\d{5}$/.test(code)) return code;
    actual = (actual as { cause?: unknown }).cause;
  }
  return undefined;
}

// Configuración compartida por la app real y por los tests: hook de
// autenticación global y traducción de errores de dominio a HTTP.
export function configurarApp(app: FastifyInstance): void {
  app.addHook('preHandler', autenticar);

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof ErrorValidacion)
      return reply.code(400).send({ error: err.message, detalles: err.detalles });
    if (err instanceof NoEncontrado) return reply.code(404).send({ error: err.message });

    // Violaciones de restricciones de Postgres (SQLSTATE) → HTTP amigable.
    const codigoSql = codigoSqlState(err);
    switch (codigoSql) {
      case '23505':
        return reply.code(409).send({ error: 'Ya existe un registro con esos valores únicos.' });
      case '23503':
        return reply.code(400).send({ error: 'Referencia inválida: el recurso relacionado no existe.' });
      case '23514':
        return reply.code(400).send({ error: 'Algún valor está fuera de los límites permitidos.' });
    }

    req.log.error(err);
    return reply.code(500).send({ error: 'Error interno' });
  });
}

// Ensambla la instancia de Fastify y registra cada dominio como plugin.
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  configurarApp(app);
  app.get('/health', async () => ({ status: 'ok' }));
  await registrarCore(app);
  // await registrarMetrics(app);  // cuando exista

  return app;
}
