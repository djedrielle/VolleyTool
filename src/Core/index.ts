import type { FastifyInstance } from 'fastify';
import { EquipoService } from './Logic/administracion/equipo.service.js';
import { DrizzleEquipoRepo } from './Data/repos/equipo.repo.js';
import { equipoRoutes } from './Controllers/equipo.controller.js';
import { JugadorService } from './Logic/administracion/jugador.service.js';
import { DrizzleJugadorRepo } from './Data/repos/jugador.repo.js';
import { jugadorRoutes } from './Controllers/jugador.controller.js';
import { CuerpoTecnicoService } from './Logic/administracion/cuerpo-tecnico.service.js';
import { DrizzleCuerpoTecnicoRepo } from './Data/repos/cuerpo-tecnico.repo.js';
import { cuerpoTecnicoRoutes } from './Controllers/cuerpo-tecnico.controller.js';
import { TorneoService } from './Logic/administracion/torneo.service.js';
import { DrizzleTorneoRepo } from './Data/repos/torneo.repo.js';
import { torneoRoutes } from './Controllers/torneo.controller.js';
import { PartidoService } from './Logic/administracion/partido.service.js';
import { DrizzlePartidoRepo } from './Data/repos/partido.repo.js';
import { partidoRoutes } from './Controllers/partido.controller.js';
import { PlantillaService } from './Logic/administracion/plantilla.service.js';
import { DrizzlePlantillaRepo } from './Data/repos/plantilla.repo.js';
import { plantillaRoutes } from './Controllers/plantilla.controller.js';
import { PlantillaTecnicoService } from './Logic/administracion/plantilla-tecnico.service.js';
import { DrizzlePlantillaTecnicoRepo } from './Data/repos/plantilla-tecnico.repo.js';
import { plantillaTecnicoRoutes } from './Controllers/plantilla-tecnico.controller.js';
import { IdentidadService } from './Logic/identidad/identidad.service.js';
import { DrizzleUsuarioRepo } from './Data/repos/usuario.repo.js';
import { authRoutes } from './Controllers/auth.controller.js';

// Composición del dominio Core: crea los repos reales, los inyecta en
// los servicios y monta las rutas como plugins de Fastify. Único lugar
// donde se decide qué implementación concreta usa cada servicio.
export async function registrarCore(app: FastifyInstance): Promise<void> {
  await app.register(authRoutes(new IdentidadService(new DrizzleUsuarioRepo())), {
    prefix: '/auth',
  });
  await app.register(equipoRoutes(new EquipoService(new DrizzleEquipoRepo())), {
    prefix: '/equipos',
  });
  await app.register(jugadorRoutes(new JugadorService(new DrizzleJugadorRepo())), {
    prefix: '/jugadores',
  });
  await app.register(
    cuerpoTecnicoRoutes(new CuerpoTecnicoService(new DrizzleCuerpoTecnicoRepo())),
    { prefix: '/cuerpo-tecnico' },
  );
  await app.register(torneoRoutes(new TorneoService(new DrizzleTorneoRepo())), {
    prefix: '/torneos',
  });
  await app.register(partidoRoutes(new PartidoService(new DrizzlePartidoRepo())), {
    prefix: '/partidos',
  });
  await app.register(plantillaRoutes(new PlantillaService(new DrizzlePlantillaRepo())), {
    prefix: '/plantillas',
  });
  await app.register(
    plantillaTecnicoRoutes(
      new PlantillaTecnicoService(new DrizzlePlantillaTecnicoRepo()),
    ),
    { prefix: '/plantillas-tecnicas' },
  );
}
