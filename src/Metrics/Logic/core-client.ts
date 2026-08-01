// El único punto de contacto de Metrics con Core. Metrics no lee las
// tablas de Core ni importa sus servicios: pide lo que necesita por
// este puerto. El adaptador vive en Data; si mañana Core corre en otro
// proceso, solo cambia ese archivo.

// El partido visto desde Metrics: quién juega y en qué torneo. La
// condición (casa/visita) importa porque el marcador de los sets se
// guarda por condición, no por equipo.
export interface PartidoDeCore {
  id: string;
  torneoId: string;
  equipoCasaId: string;
  equipoVisitaId: string;
}

export interface CoreClient {
  obtenerPartido(id: string): Promise<PartidoDeCore | null>;
  partidosDeTorneo(torneoId: string): Promise<PartidoDeCore[]>;
}
