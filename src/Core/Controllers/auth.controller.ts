import type { FastifyInstance } from 'fastify';
import type { IdentidadService } from '../Logic/identidad/identidad.service.js';

// Rutas de autenticación. El login es público (no exige token): es la
// puerta de entrada. Las credenciales inválidas las mapea el manejador
// global a 401.
export function authRoutes(service: IdentidadService) {
  return async function (app: FastifyInstance): Promise<void> {
    app.post<{ Body: { email: string; contrasena: string } }>('/login', async (req) =>
      service.login(req.body.email, req.body.contrasena),
    );
  };
}
