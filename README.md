# Misión TCP/IP — Proyecto reestructurado

Este proyecto corrige los problemas de seguridad detectados en la versión anterior:

| Problema anterior | Solución en este proyecto |
|---|---|
| Token y URL de Apps Script hardcodeados y visibles en el repo | `config.js` real vive fuera del repo (gitignored) y se genera desde GitHub Secrets al desplegar |
| La nota se calculaba en el navegador (fácil de manipular) | El servidor (`Code.gs`) recalcula la nota entera desde las respuestas crudas; el total nunca viene ya calculado del cliente |
| Cualquiera podía enviar resultados repetidos | El servidor rechaza un segundo envío del mismo apellido+nombre, y el cliente lo avisa antes de empezar |
| Posible inyección de fórmulas en la hoja (`=...`) | `Code.gs` sanitiza apellidos/nombres antes de escribirlos |
| La hoja mostraba desglose por sección | Ahora solo se guarda: Timestamp, Apellidos, Nombres, Curso, Nota final /20 |
| Las respuestas correctas y sus justificaciones estaban en el HTML público | Viven únicamente en `Code.gs`, dentro de Apps Script; el cliente solo recibe la validación de la pregunta que el alumno acaba de responder |

## ⚠️ Límite importante que debes entender

Ocultar la URL y el token del **repositorio** (lo que se pidió) es distinto de ocultarlos del **navegador**. Una vez que la página esté publicada, cualquiera que abra las herramientas de desarrollador (pestaña "Red"/"Network") podrá ver la URL y el token que se están usando, porque el navegador necesita enviarlos para que la app funcione. Eso es una limitación de cualquier aplicación 100% del lado del cliente, no algo que se pueda arreglar con configuración.

Por eso la protección real está en el servidor:
- Las respuestas correctas y el cálculo de la nota **nunca** viajan al navegador antes de tiempo.
- El servidor decide si algo es válido (duplicados, formato), no confía en lo que dice el cliente.

El token y la URL fuera del repo sirven para que **no queden documentados para siempre en el historial de git de un repositorio público**, y para frenar bots casuales — no para impedir que alguien decidido los vea en su propio navegador mientras usa la página.

## Estructura

```
frontend/              → esto es lo único que se sube a GitHub / GitHub Pages
  config.example.js     → plantilla pública (sin secretos reales)
  .gitignore             → ignora config.js real
  index.html, intro.html, seccion1..4-*.html, final.html
  assets/

backend-privado/        → NUNCA se sube a git (está en .gitignore de la raíz)
  Code.gs                → pega este código en el editor de Apps Script

.github/workflows/deploy.yml → genera config.js real desde Secrets al desplegar
```

## Pasos para dejarlo funcionando

### 1. Backend (Google Apps Script)

1. Abre tu Google Sheet de resultados → Extensiones → Apps Script.
2. Borra el código viejo y pega el contenido de `backend-privado/Code.gs`.
3. Genera un token nuevo y largo (ej. una cadena aleatoria de 32+ caracteres). Puedes generarlo con cualquier gestor de contraseñas o ejecutando en la consola del navegador `crypto.randomUUID()`.
4. Edita temporalmente la función `configurarToken()` con ese valor, ejecútala **una vez** desde el editor de Apps Script (menú desplegable de funciones → `configurarToken` → ▶ Ejecutar). Esto guarda el token en las Propiedades del script, no en el código.
5. **Importante:** como cambiaste de código (`doPost`/`doGet` distintos, nuevas acciones), crea un **nuevo despliegue**: Implementar → Nueva implementación → Aplicación web → Ejecutar como "Yo", Acceso "Cualquier usuario". Copia la nueva URL `.../exec`. La URL anterior (la que quedó expuesta en el repo viejo) queda inutilizable para el código nuevo si además borras ese despliegue viejo desde Implementar → Gestionar implementaciones.

### 2. GitHub Secrets

En tu repositorio de GitHub: Settings → Secrets and variables → Actions → New repository secret. Crea dos:
- `APPS_SCRIPT_URL` → la URL `.../exec` que copiaste.
- `API_TOKEN` → el mismo token que configuraste en el paso anterior.

### 3. Desarrollo local (opcional, para probar antes de publicar)

Dentro de `frontend/`, copia `config.example.js` como `config.js` y pon ahí tu URL y token reales para probar en tu máquina. Ese archivo nunca se sube (está en `.gitignore`).

### 4. Publicar

Sube el repo a GitHub (recuerda: `backend-privado/` y `config.js` quedan fuera automáticamente por el `.gitignore`). El workflow `.github/workflows/deploy.yml` se ejecuta en cada push a `main`, genera el `config.js` real con los Secrets, y publica el contenido de `frontend/` a la rama `gh-pages`. Activa GitHub Pages apuntando a esa rama en Settings → Pages.

## Preguntas de la evaluación

4 secciones de 5 preguntas cada una (20 en total), basadas únicamente en el contenido de https://mateo1011s.github.io/nexo-digital/:
1. Fundamentos TCP/IP y Capas de Red
2. Sockets y Protocolos de Transporte
3. Arquitectura Cliente-Servidor
4. Programación de Servidor y Cliente TCP

Cada respuesta (correcta o incorrecta) muestra de inmediato una justificación explicando por qué esa opción es correcta o incorrecta, obtenida siempre desde el servidor.
