/**
 * API.js — puente hacia el backend de Apps Script.
 *
 * La URL y el token YA NO están escritos aquí. Se leen desde
 * window.CONFIG, que carga config.js (ver config.example.js).
 * config.js está en .gitignore: nunca se sube al repositorio.
 */
const API = {
  _post: async function (payload) {
    const cfg = window.CONFIG || {};
    if (!cfg.APPS_SCRIPT_URL || !cfg.API_TOKEN) {
      console.error('Falta config.js con APPS_SCRIPT_URL y API_TOKEN.');
      return { success: false, error: 'Configuración faltante' };
    }
    payload.token = cfg.API_TOKEN;

    try {
      // Content-Type text/plain evita el preflight OPTIONS, que
      // Apps Script no maneja. e.postData.contents igual recibe
      // el JSON completo del lado del servidor.
      const response = await fetch(cfg.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      console.error('Error de red al llamar a la API:', error);
      return { success: false, error: 'network' };
    }
  },

  verificarAlumno: function (apellidos, nombres) {
    return this._post({ action: 'verificar_alumno', apellidos, nombres });
  },

  validarRespuesta: function (seccion, pregunta, respuesta) {
    return this._post({ action: 'validar_respuesta', seccion, pregunta, respuesta });
  },

  guardarResultado: function (payload) {
    payload.action = 'guardar_resultado';
    return this._post(payload);
  }
};
