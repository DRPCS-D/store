let allApps = [];
let activeDept = 'Todos';

function faviconUrl(link) {
  try {
    const domain = new URL(link).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return '';
  }
}

function linkMeta(link) {
  try {
    const u = new URL(link);
    return u.hostname + u.pathname.replace(/\/$/, '');
  } catch (e) {
    return link;
  }
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

function renderDeptBar() {
  const depts = ['Todos', ...new Set(allApps.map((a) => a.departamento).filter(Boolean))];
  const bar = document.getElementById('dept-bar');
  bar.innerHTML = depts
    .map(
      (d) =>
        `<button class="dept-chip${d === activeDept ? ' active' : ''}" data-dept="${escapeAttr(d)}">${escapeHtml(d)}</button>`
    )
    .join('');

  bar.querySelectorAll('.dept-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeDept = btn.dataset.dept;
      renderDeptBar();
      renderGrid(document.getElementById('search-input').value);
    });
  });
}

function renderGrid(filter) {
  const q = (filter || '').toLowerCase().trim();
  const grid = document.getElementById('tools-grid');
  const visibleCountEl = document.getElementById('visible-count');
  const totalCountEl = document.getElementById('total-count');

  const byDept = allApps.filter((app) => activeDept === 'Todos' || app.departamento === activeDept);

  const filtered = byDept.filter((app) => {
    if (!q) return true;
    return (
      app.nombre.toLowerCase().includes(q) ||
      app.descripcion.toLowerCase().includes(q) ||
      app.departamento.toLowerCase().includes(q) ||
      app.responsable.toLowerCase().includes(q)
    );
  });

  totalCountEl.textContent = byDept.length;
  visibleCountEl.textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="status-msg">SIN RESULTADOS<em>Probá otra búsqueda o departamento</em></div>';
    return;
  }

  grid.innerHTML = filtered
    .map(
      (app, i) => `
    <a class="tool-card" href="${escapeAttr(app.link)}" target="_blank" rel="noopener" style="animation-delay: ${i * 40}ms">
      <span class="card-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="card-icon"><img src="${faviconUrl(app.link)}" alt="" loading="lazy"/></div>
      <div class="card-title">${escapeHtml(app.nombre)}</div>
      <div class="card-desc">${escapeHtml(app.descripcion)}</div>
      <div class="card-meta">${escapeHtml(linkMeta(app.link))}</div>
      <div class="card-type">${escapeHtml(app.departamento || 'SIN DEPARTAMENTO')}</div>
      ${app.responsable ? `<div class="card-resp">Responsable: <strong>${escapeHtml(app.responsable)}</strong></div>` : ''}
      <div class="card-arrow">↗</div>
    </a>
  `
    )
    .join('');
}

async function loadApps() {
  const grid = document.getElementById('tools-grid');
  const subtitle = document.getElementById('section-subtitle');
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    allApps = data.apps || [];

    const total = allApps.length;
    subtitle.textContent = `${total} aplicación${total !== 1 ? 'es' : ''} detectada${total !== 1 ? 's' : ''} automáticamente`;

    renderDeptBar();
    renderGrid('');
  } catch (err) {
    subtitle.textContent = 'Error al conectar con Google Sheets';
    grid.innerHTML = `<div class="status-msg">NO SE PUDIERON CARGAR LAS APLICACIONES<em>${escapeHtml(err.message)}</em></div>`;
  }
}

document.getElementById('search-input').addEventListener('input', function () {
  renderGrid(this.value);
});

document.getElementById('footer-year').textContent = new Date().getFullYear();
document.getElementById('footer-updated').textContent =
  'Actualizado: ' + new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

loadApps();
