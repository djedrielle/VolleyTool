# VolleyTool CR 🏐

Herramienta para la comunidad de voleibol de Costa Rica. Su objetivo es que equipos, jugadores, cuerpo técnico y afición puedan:

1. **Registrar el rendimiento en cancha** de equipos y jugadores (estadísticas por partido, por set y por rotación).
2. **Centralizar el control de las plantillas**: ficha completa de cada jugador (nombre, cédula, fecha de nacimiento, tipo de sangre, altura, peso, lateralidad, posición y métricas físicas como el salto vertical, que se sincronizarán con **Spike Performance**).
3. **Hacer scouting de los rivales** con sus estadísticas y las grabaciones de sus partidos.
4. **Centralizar información y contenido** de la comunidad: noticias, agenda, transmisiones en vivo y videoteca.

## Demo

Este repositorio contiene la **demo conceptual** para presentar la idea a entrenadores, jugadores y aficionados, y validar las funcionalidades antes de definir la arquitectura final.

Es una aplicación web estática sin dependencias (HTML + CSS + JavaScript). **Todos los datos son ficticios** y se generan de forma determinista para que la demo siempre se vea igual.

### Cómo ejecutarla

Opción 1 — doble clic en `index.html` (funciona sin servidor).

Opción 2 — con un servidor local:

```
python -m http.server 8123
# luego abrir http://localhost:8123
```

Es responsive: se puede enseñar desde el teléfono, una tableta o la computadora.

### Qué incluye

| Sección | Qué demuestra |
| --- | --- |
| **Inicio** | Resumen de la liga: partido en vivo, próximos partidos, tablas de posiciones y noticias. |
| **Equipos** | Perfil de cada club: plantilla, estadísticas del torneo, partidos y grabaciones. Incluye el formulario para registrar jugadores con su ficha completa. |
| **Jugador** | Ficha personal, métricas físicas (integración futura con Spike Performance) y radar de habilidades. |
| **Partidos** | Resultados con marcador por set, estadísticas comparadas y efectividad de ataque por rotación (R1–R6). |
| **Captura en vivo** | La planilla digital: registrar cada acción (saque, ataque, bloqueo, recepción) por rotación y jugador, con porcentajes al instante. Lo capturado se guarda en el navegador (`localStorage`). |
| **Videos** | Transmisión en vivo simulada y videoteca de grabaciones por partido. |
| **Scouting** | Comparador de dos equipos con informe automático: rotación más fuerte/débil, jugadores a vigilar y grabaciones del rival. |
| **Comunidad** | Noticias, agenda y la lista de lo que vendría en la versión completa. |

El botón **«Restablecer demo»** (pie de página) borra los jugadores y partidos registrados durante una presentación.

### Estructura

```
index.html        Estructura de la página y navegación
css/styles.css    Estilos (tema oscuro deportivo, responsive)
js/data.js        Datos ficticios de demostración (equipos, jugadores, partidos, videos, noticias)
js/app.js         Lógica: vistas, enrutado, captura en vivo, gráficos SVG y almacenamiento local
```

## Próximos pasos

Con las conclusiones de la demo se definirán la arquitectura, las tecnologías y el plan de implementación de la versión completa (cuentas por club, captura por jugador, transmisión real de video, integración con Spike Performance, gestión de torneos).
