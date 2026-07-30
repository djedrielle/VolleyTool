// Errores de dominio transversales. Los servicios los lanzan sin saber
// nada de HTTP; el manejador de errores de Fastify (en app.ts) los
// traduce a códigos de estado.

export class ErrorValidacion extends Error {
  constructor(public readonly detalles: string[]) {
    super('Validación fallida');
    this.name = 'ErrorValidacion';
  }
}

export class NoEncontrado extends Error {
  constructor(recurso: string, id: string) {
    super(`${recurso} ${id} no existe`);
    this.name = 'NoEncontrado';
  }
}
