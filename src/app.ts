import Fastify, { type FastifyInstance } from 'fastify';

// Ensambla la instancia de Fastify: aquí irá el middleware global
// (verificación del JWT, CORS, manejo de errores) y el registro de las
// rutas de cada dominio. Cada dominio expondrá sus Controllers como un
// plugin de Fastify y se registrará debajo con su propio prefijo.
export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.get('/health', async () => ({ status: 'ok' }));

  // await app.register(coreRoutes, { prefix: '/api/core' });
  // await app.register(metricsRoutes, { prefix: '/api/metrics' });

  return app;
}
