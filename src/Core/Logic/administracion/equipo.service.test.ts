import { describe, it, expect } from 'vitest';
import { EquipoService, type EquipoRepo } from './equipo.service.js';
import type { Equipo, NuevoEquipo } from '../dominio/equipo.js';

// Repo falso en memoria: cumple la interfaz EquipoRepo sin tocar la
// base. Es lo que hace que los servicios se puedan probar sin Postgres.
class RepoFalso implements EquipoRepo {
  private datos: Equipo[] = [];

  async listar() {
    return [...this.datos];
  }
  async obtener(id: string) {
    return this.datos.find((e) => e.id === id) ?? null;
  }
  async crear(d: NuevoEquipo) {
    const e: Equipo = {
      id: String(this.datos.length + 1),
      creadoEn: new Date(),
      provincia: null,
      sede: null,
      color: null,
      fundado: null,
      ...d,
    };
    this.datos.push(e);
    return e;
  }
  async actualizar(id: string, cambios: Partial<NuevoEquipo>) {
    const e = this.datos.find((x) => x.id === id);
    if (!e) return null;
    Object.assign(e, cambios);
    return e;
  }
}

describe('EquipoService', () => {
  it('crea un equipo válido', async () => {
    const s = new EquipoService(new RepoFalso());
    const e = await s.crear({ nombre: 'Volcanes de Heredia', corto: 'VOL', categoria: 'femenino' });
    expect(e.id).toBeTruthy();
    expect(e.nombre).toBe('Volcanes de Heredia');
  });

  it('rechaza un código corto inválido', async () => {
    const s = new EquipoService(new RepoFalso());
    await expect(
      s.crear({ nombre: 'Equipo X', corto: 'A', categoria: 'femenino' }),
    ).rejects.toThrow();
  });

  it('obtener lanza si el equipo no existe', async () => {
    const s = new EquipoService(new RepoFalso());
    await expect(s.obtener('no-existe')).rejects.toThrow();
  });

  it('lista los equipos creados', async () => {
    const s = new EquipoService(new RepoFalso());
    await s.crear({ nombre: 'Volcanes', corto: 'VOL', categoria: 'femenino' });
    await s.crear({ nombre: 'Ticas', corto: 'TSJ', categoria: 'femenino' });
    expect(await s.listar()).toHaveLength(2);
  });
});
