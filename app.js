// ==========================================================================
// APP — router, eventos y formularios
// ==========================================================================

const NAV_MAIN = ['dashboard', 'itinerario', 'caja', 'gastos', 'mas'];
const VIEW_RENDERERS = {
  dashboard: renderDashboard,
  caja: renderCaja,
  gastos: renderGastos,
  presupuesto: renderPresupuesto,
  alojamiento: renderAlojamiento,
  ruta: renderRuta,
  tareas: renderTareas,
  compras: renderCompras,
  mantenimiento: renderMantenimiento,
  itinerario: renderItinerario,
  mas: renderMas,
  equipaje: renderEquipaje,
  inventario: renderInventario,
  documentos: renderDocumentos,
  resumen: renderResumen,
  config: renderConfig
};
const NAV_ICON = {
  dashboard: '🏠', itinerario: '📅', caja: '💰', gastos: '💳', mas: '☰'
};
const NAV_LABEL = {
  dashboard: 'Inicio', itinerario: 'Itinerario', caja: 'Caja', gastos: 'Gastos', mas: 'Más'
};

let currentView = 'dashboard';

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

async function refreshData() {
  try {
    await State.load();
  } catch (err) {
    toast('Error al cargar datos: ' + err.message);
  }
}

function renderTopbar() {
  const cfg = State.config;
  const phase = State.tripPhase();
  const phaseLabel = { pre: 'Pre-viaje', start: 'Hoy sale el viaje', during: 'Viaje en curso', post: 'Viaje finalizado' }[phase];
  document.getElementById('topbar').innerHTML = `
    <div class="trip-name">🇧🇷 ${esc(cfg.tripName || 'Brasil 2026')}</div>
    <div class="trip-sub">${esc(cfg.travelerA)} ❤️ ${esc(cfg.travelerB)} · ${esc(cfg.destination || '')}</div>
    <span class="status-pill">${phaseLabel}</span>
  `;
}

function renderBottomNav() {
  document.getElementById('bottom-nav').innerHTML = NAV_MAIN.map((v) => `
    <button class="nav-btn ${isNavActive(v) ? 'active' : ''}" data-action="goto" data-view="${v}">
      <span class="ic">${NAV_ICON[v]}</span>${NAV_LABEL[v]}
    </button>
  `).join('');
}

function isNavActive(navKey) {
  if (navKey === 'mas') {
    return !NAV_MAIN.includes(currentView);
  }
  return currentView === navKey;
}

function renderView(viewKey) {
  currentView = viewKey;
  const renderer = VIEW_RENDERERS[viewKey];
  const container = document.getElementById('app-view');
  container.innerHTML = renderer ? renderer() : emptyState('Sección no encontrada.');
  renderBottomNav();
  renderTopbar();
  if (viewKey === 'dashboard') initDashboardCharts();
  if (viewKey === 'presupuesto') initPresupuestoChart();
  window.scrollTo(0, 0);
}

// ---------------------------------------------------------- generic sheet form

function openSheetForm(sheetName, existing) {
  const schema = FORM_SCHEMAS[sheetName];
  if (!schema) return;
  const isEdit = !!existing;
  const item = existing || {};

  const fieldsHtml = schema.fields.map((f) => {
    const val = item[f.name] !== undefined ? item[f.name] : '';
    if (f.type === 'select') {
      return `
        <div class="field">
          <label>${f.label}</label>
          <select name="${f.name}" ${f.required ? 'required' : ''}>
            <option value="">—</option>
            ${f.options.map((o) => `<option value="${esc(o)}" ${val === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}
          </select>
        </div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="field"><label>${f.label}</label><textarea name="${f.name}">${esc(val)}</textarea></div>`;
    }
    if (f.type === 'checkbox') {
      return `<div class="field"><label><input type="checkbox" name="${f.name}" ${val === true || val === 'TRUE' || val === true ? 'checked' : ''} style="width:auto;margin-right:6px;"> ${f.label}</label></div>`;
    }
    const listAttr = f.list ? `list="dl-${f.name}"` : '';
    const listHtml = f.list ? `<datalist id="dl-${f.name}">${f.list.map((o) => `<option value="${esc(o)}">`).join('')}</datalist>` : '';
    return `
      <div class="field">
        <label>${f.label}</label>
        <input type="${f.type}" name="${f.name}" value="${esc(val)}" ${f.required ? 'required' : ''} ${listAttr} placeholder="${esc(f.placeholder || '')}">
        ${listHtml}
      </div>`;
  }).join('');

  const html = `
    <h3>${isEdit ? 'Editar' : 'Nuevo'} — ${schema.title}</h3>
    <form id="sheet-form">
      ${fieldsHtml}
      <div class="sheet-actions">
        <button type="button" class="btn ghost" data-action="close-sheet">Cancelar</button>
        <button type="submit" class="btn primary">Guardar</button>
      </div>
    </form>
  `;
  showSheet(html);

  document.getElementById('sheet-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    schema.fields.forEach((f) => {
      if (f.type === 'checkbox') {
        data[f.name] = formData.has(f.name);
      } else {
        data[f.name] = formData.get(f.name) || '';
      }
    });
    try {
      if (isEdit) {
        await Api.update(sheetName, item.id, data);
        toast('Guardado.');
      } else {
        await Api.add(sheetName, data);
        toast('Agregado.');
      }
      closeSheet();
      await refreshData();
      renderView(currentView);
    } catch (err) {
      toast('Error: ' + err.message);
    }
  });
}

// ---------------------------------------------------------- config editors

function openConfigForm(title, fields) {
  const cfg = State.config;
  const fieldsHtml = fields.map((f) => `
    <div class="field">
      <label>${f.label}</label>
      <input type="${f.type}" name="${f.key}" value="${esc(cfg[f.key] || '')}">
    </div>
  `).join('');
  const html = `
    <h3>${title}</h3>
    <form id="config-form">
      ${fieldsHtml}
      <div class="sheet-actions">
        <button type="button" class="btn ghost" data-action="close-sheet">Cancelar</button>
        <button type="submit" class="btn primary">Guardar</button>
      </div>
    </form>
  `;
  showSheet(html);
  document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {};
    fields.forEach((f) => { updates[f.key] = formData.get(f.key) || ''; });
    try {
      await Api.updateConfig(updates);
      toast('Guardado.');
      closeSheet();
      await refreshData();
      renderView(currentView);
    } catch (err) {
      toast('Error: ' + err.message);
    }
  });
}

function editTripForm() {
  openConfigForm('Datos generales del viaje', [
    { key: 'tripName', label: 'Nombre del viaje', type: 'text' },
    { key: 'travelerA', label: 'Viajero 1', type: 'text' },
    { key: 'travelerB', label: 'Viajero 2', type: 'text' },
    { key: 'origin', label: 'Origen', type: 'text' },
    { key: 'destination', label: 'Destino', type: 'text' },
    { key: 'departureDate', label: 'Fecha de salida', type: 'date' },
    { key: 'departureTime', label: 'Hora de salida', type: 'time' }
  ]);
}

function editVehicleForm() {
  openConfigForm('Vehículo y combustible', [
    { key: 'vehicleBrand', label: 'Marca', type: 'text' },
    { key: 'vehicleModel', label: 'Modelo', type: 'text' },
    { key: 'vehicleYear', label: 'Año', type: 'text' },
    { key: 'vehicleFuelType', label: 'Combustible', type: 'text' },
    { key: 'tankRangeKm', label: 'Autonomía por tanque (km)', type: 'number' },
    { key: 'tankCostARS', label: 'Precio tanque lleno (ARS)', type: 'number' },
    { key: 'fuelMarginPercent', label: 'Margen de seguridad (%)', type: 'number' },
    { key: 'vehicleMileage', label: 'Kilometraje actual', type: 'number' },
    { key: 'vehicleNextService', label: 'Próximo service', type: 'text' }
  ]);
}

function editAccommodationForm() {
  openConfigForm('Alojamiento', [
    { key: 'accommodationAddress', label: 'Dirección', type: 'text' },
    { key: 'checkIn', label: 'Check-in', type: 'datetime-local' },
    { key: 'checkOutLimit', label: 'Check-out límite', type: 'datetime-local' },
    { key: 'plannedReturnDeparture', label: 'Salida prevista (regreso)', type: 'datetime-local' },
    { key: 'accommodationTotalPrice', label: 'Precio total', type: 'number' },
    { key: 'accommodationCurrency', label: 'Moneda', type: 'text' },
    { key: 'accommodationDeposit', label: 'Seña', type: 'number' },
    { key: 'accommodationPaid', label: 'Pagado', type: 'number' },
    { key: 'accommodationPending', label: 'Pendiente', type: 'number' },
    { key: 'accommodationPaymentDate', label: 'Fecha de pago', type: 'date' },
    { key: 'accommodationLink', label: 'Link de la reserva', type: 'text' },
    { key: 'accommodationContact', label: 'Contacto', type: 'text' },
    { key: 'accommodationGuests', label: 'Huéspedes', type: 'number' },
    { key: 'accommodationConfirmationCode', label: 'Código de confirmación', type: 'text' },
    { key: 'accommodationCheckInMethod', label: 'Método de check-in', type: 'text' },
    { key: 'accommodationCancellationPolicy', label: 'Política de cancelación', type: 'text' }
  ]);
}

// ---------------------------------------------------------- sheet (modal) plumbing

function showSheet(innerHtml) {
  document.getElementById('sheet-content').innerHTML = innerHtml;
  document.getElementById('sheet-backdrop').classList.add('open');
  document.getElementById('sheet').classList.add('open');
}

function closeSheet() {
  document.getElementById('sheet-backdrop').classList.remove('open');
  document.getElementById('sheet').classList.remove('open');
}

// ---------------------------------------------------------- event delegation

document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'goto') {
    renderView(el.dataset.view);
    return;
  }
  if (action === 'close-sheet' || el.id === 'sheet-backdrop') {
    closeSheet();
    return;
  }
  if (action === 'new') {
    openSheetForm(el.dataset.sheet);
    return;
  }
  if (action === 'edit') {
    const sheet = el.dataset.sheet;
    const id = el.dataset.id;
    const item = State[sheet].find((x) => String(x.id) === String(id));
    openSheetForm(sheet, item);
    return;
  }
  if (action === 'delete') {
    const sheet = el.dataset.sheet;
    const id = el.dataset.id;
    if (!confirm('¿Eliminar este registro?')) return;
    try {
      await Api.remove(sheet, id);
      toast('Eliminado.');
      await refreshData();
      renderView(currentView);
    } catch (err) {
      toast('Error: ' + err.message);
    }
    return;
  }
  if (action === 'toggle-packed') {
    try {
      await Api.update('Luggage', el.dataset.id, { packed: el.dataset.packed === 'true' });
      await refreshData();
      renderView(currentView);
    } catch (err) {
      toast('Error: ' + err.message);
    }
    return;
  }
  if (action === 'edit-trip') { editTripForm(); return; }
  if (action === 'edit-vehicle') { editVehicleForm(); return; }
  if (action === 'edit-accommodation') { editAccommodationForm(); return; }
});

document.getElementById('sheet-backdrop') && document.getElementById('sheet-backdrop').addEventListener('click', closeSheet);

// ---------------------------------------------------------- init

async function init() {
  if (APPS_SCRIPT_URL.indexOf('PEGAR_URL') !== -1) {
    document.getElementById('app-view').innerHTML = `
      <div class="card">
        <div class="card-title">Falta configurar</div>
        <p>Todavía no se configuró la URL del Apps Script. Abrí <code>public/js/config.js</code> y pegá la URL que te dio Google Apps Script al implementar el backend como aplicación web.</p>
        <p class="muted">Ver <code>README.md</code> para el paso a paso completo.</p>
      </div>`;
    return;
  }
  document.getElementById('app-view').innerHTML = emptyState('Cargando datos del viaje…');
  await refreshData();
  renderView('dashboard');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

init();
