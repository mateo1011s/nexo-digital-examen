/**
 * PLANTILLA de configuración. Este archivo SÍ se sube al repo.
 *
 * Para desarrollo local:
 *   1. Copia este archivo como "config.js" (mismo folder).
 *   2. Reemplaza los valores con tu URL y token reales.
 *   3. "config.js" ya está en .gitignore, así que nunca se subirá.
 *
 * Para el sitio publicado (GitHub Pages):
 *   El workflow de GitHub Actions (.github/workflows/deploy.yml)
 *   genera un config.js real a partir de los Secrets del repo
 *   (Settings > Secrets and variables > Actions) durante el
 *   despliegue. Ese config.js real nunca queda en el historial
 *   de la rama principal del repositorio.
 */
window.CONFIG = {
  APPS_SCRIPT_URL: 'PON_AQUI_TU_URL_DE_APPS_SCRIPT_/exec',
  API_TOKEN: 'PON_AQUI_TU_TOKEN'
};
