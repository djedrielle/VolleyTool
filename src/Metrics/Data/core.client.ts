import { PartidoService } from '../../Core/Logic/administracion/partido.service.js';
import { DrizzlePartidoRepo } from '../../Core/Data/repos/partido.repo.js';
import type { Partido } from '../../Core/Logic/dominio/partido.js';
import type { CoreClient, PartidoDeCore } from '../Logic/core-client.js';
import { NoEncontrado } from '../../shared/errors.js';

// Adaptador del puerto CoreClient: hoy Core vive en el mismo proceso,
// así que es una llamada directa a su servicio. Traduce el partido de
// Core al que entiende Metrics (local → casa) y convierte el 404 en
// null: para Metrics "no existe" no es un error, es un dato.
function traducir(p: Partido): PartidoDeCore {
  return {
    id: p.id,
    torneoId: p.torneoId,
    equipoCasaId: p.equipoLocalId,
    equipoVisitaId: p.equipoVisitaId,
  };
}

export class CoreClientLocal implements CoreClient {
  constructor(private readonly partidos = new PartidoService(new DrizzlePartidoRepo())) {}

  async obtenerPartido(id: string): Promise<PartidoDeCore | null> {
    try {
      return traducir(await this.partidos.obtener(id));
    } catch (err) {
      if (err instanceof NoEncontrado) return null;
      throw err;
    }
  }

  async partidosDeTorneo(torneoId: string): Promise<PartidoDeCore[]> {
    const partidos = await this.partidos.listarPorTorneo(torneoId);
    return partidos.map(traducir);
  }
}
