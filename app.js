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
    grid.innerHTML =
      '<div class="col-span-full text-center text-on-surface-variant py-16">No se encontraron apps.</div>';
    return;
  }

  grid.innerHTML = filtered
    .map(
      (app) => `
    <div class="flex flex-col gap-3 bg-surface-container-lowest rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-surface-container">
          <img class="w-full h-full object-cover" src="${faviconUrl(app.link)}" alt="" loading="lazy" />
        </div>
        <div class="flex flex-col min-w-0">
          <h3 class="font-semibold text-[15px] text-on-surface truncate">${escapeHtml(app.nombre)}</h3>
          <span class="text-[12px] font-semibold text-primary truncate">${escapeHtml(app.categoria)}</span>
        </div>
      </div>
      <p class="text-[13px] text-on-surface-variant leading-snug line-clamp-3 flex-1">${escapeHtml(app.descripcion)}</p>
      <a class="text-center py-2 rounded-full bg-primary-container text-on-primary font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all" href="${escapeAttr(app.link)}" target="_blank" rel="noopener noreferrer">Abrir</a>
    </div>
  `
    )
    .join('');
}

function renderCategories() {
  const categories = ['Todas', ...new Set(allApps.map((a) => a.categoria).filter(Boolean))];
  const wrap = document.getElementById('categories');
  wrap.innerHTML = categories
    .map((cat) => {
      const active = cat === activeCategory;
      const classes = active
        ? 'bg-primary-container text-on-primary shadow-sm'
        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container';
      return `<button data-cat="${escapeAttr(cat)}" class="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all active:scale-95 ${classes}">${escapeHtml(cat)}</button>`;
    })
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
    grid.innerHTML = `<div class="col-span-full text-center text-on-surface-variant py-16">No se pudieron cargar las apps. Revisa la URL de Apps Script en config.js.<br><small>${escapeHtml(
      err.message
    )}</small></div>`;
  }
}

document.getElementById('search').addEventListener('input', render);
loadApps();
