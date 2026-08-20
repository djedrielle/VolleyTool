// Bootstrap de usuarios (sobre todo el admin inicial). Uso:
//   npx tsx scripts/crear-usuario.ts <email> <contrasena> [rol]
// rol por defecto: administrador. Necesita la base levantada.
import { IdentidadService } from '../src/Core/Logic/identidad/identidad.service.js';
import { DrizzleUsuarioRepo } from '../src/Core/Data/repos/usuario.repo.js';
import type { Rol } from '../src/Core/Logic/identidad/roles.js';

const [email, contrasena, rol = 'administrador'] = process.argv.slice(2);

if (!email || !contrasena) {
  console.error('Uso: npx tsx scripts/crear-usuario.ts <email> <contrasena> [rol]');
  process.exit(1);
}

const servicio = new IdentidadService(new DrizzleUsuarioRepo());
const usuario = await servicio.crear({ email, contrasena, rol: rol as Rol });
console.log('Usuario creado:', usuario);
process.exit(0);
