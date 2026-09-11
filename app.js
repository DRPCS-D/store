let allApps = [];
let activeCategory = 'Todas';

function faviconUrl(link) {
  try {
    const domain = new URL(link).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return '';
  }
}

function render() {
  const grid = document.getElementById('grid');
  const query = document.getElementById('search').value.trim().toLowerCase();

  const filtered = allApps.filter((app) => {
    const matchesCategory = activeCategory === 'Todas' || app.categoria === activeCategory;
    const matchesQuery =
      !query ||
      app.nombre.toLowerCase().includes(query) ||
      app.descripcion.toLowerCase().includes(query) ||
      app.categoria.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty">No se encontraron apps.</div>';
    return;
  }

  grid.innerHTML = filtered
    .map(
      (app) => `
    <div class="card">
      <div class="card-top">
        <img class="icon" src="${faviconUrl(app.link)}" alt="" loading="lazy" />
        <div class="card-info">
          <h3>${escapeHtml(app.nombre)}</h3>
          <div class="category">${escapeHtml(app.categoria)}</div>
        </div>
      </div>
      <div class="description">${escapeHtml(app.descripcion)}</div>
      <a class="open-btn" href="${escapeAttr(app.link)}" target="_blank" rel="noopener noreferrer">Abrir</a>
    </div>
  `
    )
    .join('');
}

function renderCategories() {
  const categories = ['Todas', ...new Set(allApps.map((a) => a.categoria).filter(Boolean))];
  const wrap = document.getElementById('categories');
  wrap.innerHTML = categories
    .map(
      (cat) =>
        `<button data-cat="${escapeAttr(cat)}" class="${cat === activeCategory ? 'active' : ''}">${escapeHtml(cat)}</button>`
    )
    .join('');

  wrap.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderCategories();
      render();
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

async function loadApps() {
  const grid = document.getElementById('grid');
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    allApps = data.apps || [];
    renderCategories();
    render();
  } catch (err) {
    grid.innerHTML = `<div class="empty">No se pudieron cargar las apps. Revisa la URL de Apps Script en config.js.<br><small>${escapeHtml(
      err.message
    )}</small></div>`;
  }
}

document.getElementById('search').addEventListener('input', render);
loadApps();
