// ==========================================================================
// API — comunicación con Google Apps Script vía JSONP
// (mismo patrón usado en GG Taller / BC Salud / Bunker GN)
// ==========================================================================

const Api = (function () {
  let callbackCounter = 0;

  function jsonp(params) {
    return new Promise(function (resolve, reject) {
      const cbName = '__brasilTripCb' + (callbackCounter++);
      const query = Object.keys(params)
        .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(
          typeof params[k] === 'object' ? JSON.stringify(params[k]) : params[k]
        ); })
        .join('&');

      const script = document.createElement('script');
      const timeout = setTimeout(function () {
        cleanup();
        reject(new Error('Tiempo de espera agotado al contactar el servidor.'));
      }, 15000);

      function cleanup() {
        clearTimeout(timeout);
        delete window[cbName];
        script.remove();
      }

      window[cbName] = function (data) {
        cleanup();
        if (data && data.error) reject(new Error(data.error));
        else resolve(data);
      };

      script.src = APPS_SCRIPT_URL + '?' + query + '&callback=' + cbName;
      script.onerror = function () {
        cleanup();
        reject(new Error('No se pudo contactar el Apps Script. Revisá la URL en config.js.'));
      };
      document.body.appendChild(script);
    });
  }

  return {
    getAll: function () {
      return jsonp({ action: 'getAll' });
    },
    getConfig: function () {
      return jsonp({ action: 'getConfig' });
    },
    updateConfig: function (updates) {
      return jsonp({ action: 'updateConfig', data: updates });
    },
    add: function (sheet, data) {
      return jsonp({ action: 'add', sheet: sheet, data: data });
    },
    update: function (sheet, id, data) {
      return jsonp({ action: 'update', sheet: sheet, id: id, data: data });
    },
    remove: function (sheet, id) {
      return jsonp({ action: 'delete', sheet: sheet, id: id });
    }
  };
})();
