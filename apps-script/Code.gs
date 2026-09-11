/**
 * DRPCS Store - Backend en Google Apps Script
 *
 * Instrucciones de instalación:
 * 1. Crea un Google Sheet nuevo.
 * 2. Renombra la primera hoja (pestaña) a: Apps
 * 3. En la fila 1 pon estos encabezados exactamente, en este orden:
 *    Nombre | Descripcion | Categoria | Link | Publicado
 * 4. Ve a Extensiones > Apps Script, borra el contenido de Code.gs
 *    y pega todo este archivo.
 * 5. Haz clic en "Implementar" > "Nueva implementación".
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquier usuario
 * 6. Copia la URL de la aplicación web (termina en /exec) y pégala
 *    en el archivo config.js del sitio (APPS_SCRIPT_URL).
 *
 * Columnas del Sheet:
 * - Nombre:      Nombre de la app (texto)
 * - Descripcion: Descripción corta de la app (texto)
 * - Categoria:   Categoría de la app (texto), ej: "Productividad", "Juegos"
 * - Link:        URL completa donde vive la app publicada
 * - Publicado:   TRUE o FALSE (checkbox). Solo se muestran las filas TRUE.
 */

const SHEET_NAME = 'Apps';

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonResponse({ error: 'No se encontró la hoja "' + SHEET_NAME + '"' });
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return jsonResponse({ apps: [] });
  }

  const headers = values[0].map(function (h) { return String(h).trim(); });
  const rows = values.slice(1);

  const apps = rows
    .map(function (row) {
      const item = {};
      headers.forEach(function (header, i) {
        item[header] = row[i];
      });
      return item;
    })
    .filter(function (item) {
      return item.Nombre && item.Link && (item.Publicado === true || item.Publicado === 'TRUE');
    })
    .map(function (item) {
      return {
        nombre: String(item.Nombre || '').trim(),
        descripcion: String(item.Descripcion || '').trim(),
        categoria: String(item.Categoria || '').trim(),
        link: String(item.Link || '').trim()
      };
    });

  return jsonResponse({ apps: apps });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
