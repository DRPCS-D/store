# DRPCS Store

Tienda de apps web personales, estilo Play Store / App Store. El listado de apps se administra desde un Google Sheet mediante un Web App de Google Apps Script; el sitio es estático y se publica en GitHub Pages.

## 1. Configurar el Google Sheet + Apps Script

1. Crea un Google Sheet nuevo.
2. Renombra la primera pestaña a `Apps`.
3. En la fila 1 pon estos encabezados exactos:

   | Nombre | Descripcion | Categoria | Link | Publicado |
   |---|---|---|---|---|

   - **Nombre**: nombre de la app.
   - **Descripcion**: descripción corta.
   - **Categoria**: ej. "Productividad", "Juegos", "Utilidades".
   - **Link**: URL completa donde vive la app (ej. `https://miapp.vercel.app`).
   - **Publicado**: casilla (checkbox) TRUE/FALSE. Solo las filas en TRUE aparecen en la tienda.

4. Agrega una fila por cada app.
5. Ve a **Extensiones > Apps Script**.
6. Borra el contenido por defecto y pega el contenido de [`apps-script/Code.gs`](apps-script/Code.gs).
7. Haz clic en **Implementar > Nueva implementación**.
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
8. Copia la URL que termina en `/exec`.

## 2. Configurar el sitio

Abre [`config.js`](config.js) y reemplaza la URL:

```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_ID_DE_DESPLIEGUE/exec';
```

## 3. Cómo funciona el ícono de cada app

El ícono se obtiene automáticamente a partir del dominio del link usando el servicio de favicons de Google (`https://www.google.com/s2/favicons?domain=...`). No necesitas subir ningún ícono.

## 4. Publicar en GitHub Pages

```bash
git init
git add .
git commit -m "Sitio inicial de DRPCS Store"
git branch -M main
git remote add origin https://github.com/Diago2077/drpcs-store.git
git push -u origin main
```

Luego, en GitHub: **Settings > Pages > Source: Deploy from a branch > Branch: main / (root)**.

El sitio quedará disponible en `https://diago2077.github.io/drpcs-store/`.

## 5. Actualizar apps

Para agregar, quitar o editar una app, solo edita el Google Sheet. El sitio se actualiza automáticamente en cada carga (no requiere volver a publicar).
