import { describe, it, expect } from 'vitest';
import {
  IdentidadService,
  type UsuarioRepo,
  type UsuarioConHash,
} from './identidad.service.js';
import { verificarToken } from '../../../shared/http/jwt.js';
import type { Rol } from './roles.js';

class RepoFalso implements UsuarioRepo {
  datos: UsuarioConHash[] = [];
  async crear(d: { email: string; hashContrasena: string; rol: Rol; alcance: string | null }) {
    const u: UsuarioConHash = {
      id: String(this.datos.length + 1),
      email: d.email,
      rol: d.rol,
      alcance: d.alcance,
      creadoEn: new Date(),
      hashContrasena: d.hashContrasena,
    };
    this.datos.push(u);
    const { hashContrasena: _omit, ...pub } = u;
    return pub;
  }
  async buscarPorEmail(email: string) {
    return this.datos.find((u) => u.email === email) ?? null;
  }
}

describe('IdentidadService', () => {
  it('crea un usuario y permite loguear con la clave correcta', async () => {
    const svc = new IdentidadService(new RepoFalso());
    await svc.crear({ email: 'a@b.cr', contrasena: 'clave1234', rol: 'administrador' });
    const { token, usuario } = await svc.login('a@b.cr', 'clave1234');
    expect(usuario.rol).toBe('administrador');
    expect((await verificarToken(token)).sub).toBe(usuario.id);
  });

  it('rechaza la clave incorrecta', async () => {
    const svc = new IdentidadService(new RepoFalso());
    await svc.crear({ email: 'a@b.cr', contrasena: 'clave1234' });
    await expect(svc.login('a@b.cr', 'mala')).rejects.toThrow();
  });

  it('rechaza un correo que no existe (mismo error)', async () => {
    const svc = new IdentidadService(new RepoFalso());
    await expect(svc.login('nadie@b.cr', 'clave1234')).rejects.toThrow();
  });

  it('normaliza el email a minúsculas al crear y loguear', async () => {
    const svc = new IdentidadService(new RepoFalso());
    await svc.crear({ email: 'A@B.CR', contrasena: 'clave1234' });
    const { usuario } = await svc.login('a@b.cr', 'clave1234');
    expect(usuario.email).toBe('a@b.cr');
  });

  it('valida el correo y la longitud de la contraseña', async () => {
    const svc = new IdentidadService(new RepoFalso());
    await expect(svc.crear({ email: 'noesmail', contrasena: 'corta' })).rejects.toThrow();
  });
});
