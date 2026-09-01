// ==========================================================================
// VIEWS — generación de HTML por sección
// ==========================================================================

function esc(v) {
  if (v === undefined || v === null) return '';
  return String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmt(amount, currency) {
  const n = Number(amount) || 0;
  const sym = CURRENCY_SYMBOL[currency] || '$';
  return sym + n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

function fmtDate(d) {
  if (!d) return '';
  const s = String(d).slice(0, 10);
  const parts = s.split('-');
  if (parts.length !== 3) return s;
  return `${parts[2]}/${parts[1]}`;
}

function emptyState(text) {
  return `<div class="empty-state">${esc(text)}</div>`;
}

// -------------------------------------------------------------- DASHBOARD

function renderDashboard() {
  const cfg = State.config;
  const days = State.daysUntil(cfg.departureDate);
  const phase = State.tripPhase();
  let flag = `⏳ FALTAN ${days} DÍAS`;
  if (phase === 'start') flag = '🚗 ¡HOY COMIENZA EL VIAJE!';
  if (phase === 'during') flag = '🌴 VIAJE EN CURSO';
  if (phase === 'post') flag = '🏠 VIAJE FINALIZADO';

  const cash = State.cashSummary();
  const mainCash = cash.BRL && (cash.BRL.in || cash.BRL.out) ? cash.BRL : cash.ARS;
  const mainCur = cash.BRL && (cash.BRL.in || cash.BRL.out) ? 'BRL' : 'ARS';

  const budget = State.budgetRows();
  const totalBudget = budget.reduce((s, b) => s + (Number(b.budgetAmount) || 0), 0);
  const totalSpent = budget.reduce((s, b) => s + b.gastado, 0);

  const pendingTasks = State.pendingTasks().length;
  const overdueTasks = State.overdueTasks().length;
  const pendingPurchases = State.pendingPurchases().length;
  const pendingMaintenance = State.pendingMaintenance().length;

  const routeIda = State.Routes.filter((r) => r.leg === 'Ida');
  const totalKm = routeIda.reduce((s, r) => s + (Number(r.km) || 0), 0);
  const totalHours = routeIda.reduce((s, r) => s + (Number(r.hours) || 0), 0);
  const fuel = totalKm > 0 ? State.fuelCalc(totalKm) : null;

  const today = new Date().toISOString().slice(0, 10);
  const todayItin = State.itineraryForDate(today);

  return `
    <div class="countdown-hero">
      <div class="flag">🇧🇷 ${esc(cfg.tripName || 'VIAJE A BRASIL')} · ${esc(cfg.travelerA)} ❤️ ${esc(cfg.travelerB)}</div>
      <div class="countdown-number">${{ pre: days, start: '🚗', during: '🌴', post: '🏠' }[phase]}</div>
      <div class="countdown-label">${flag}</div>
    </div>

    <div class="card">
      <div class="card-title">🚗 Roadtrip · ${esc(cfg.origin || '')} → ${esc(cfg.destination || '')}</div>
      <div class="grid-3">
        <div class="stat"><div class="stat-value">${totalKm || '—'}</div><div class="stat-label">Kilómetros</div></div>
        <div class="stat"><div class="stat-value">${totalHours || '—'}</div><div class="stat-label">Horas</div></div>
        <div class="stat coral"><div class="stat-value">${fuel ? fuel.tanksRounded : '—'}</div><div class="stat-label">Tanques</div></div>
      </div>
      ${fuel ? `<div class="summary-row mt-8"><span class="label">Combustible estimado</span><span class="value">${fmt(fuel.cost, 'ARS')}</span></div>` : ''}
    </div>

    <div class="card">
      <div class="card-title">🏠 Alojamiento</div>
      <div class="summary-row"><span class="label">Estadía</span><span class="value">${fmtDate(cfg.checkIn)} → ${fmtDate(cfg.checkOutLimit)}</span></div>
      <div class="summary-row"><span class="label">Check-in</span><span class="value">${cfg.checkIn ? cfg.checkIn.slice(11, 16) : '—'}</span></div>
      <div class="summary-row"><span class="label">Check-out límite</span><span class="value">${cfg.checkOutLimit ? cfg.checkOutLimit.slice(11, 16) : '—'}</span></div>
      <div class="summary-row"><span class="label">Salida prevista (regreso)</span><span class="value">${cfg.plannedReturnDeparture ? cfg.plannedReturnDeparture.slice(11, 16) : '—'}</span></div>
    </div>

    <div class="card">
      <div class="card-title">💰 Caja del viaje ${mainCur !== 'ARS' ? '(' + mainCur + ')' : ''}</div>
      <div class="summary-row"><span class="label">Ingresos</span><span class="value">${fmt(mainCash ? mainCash.in : 0, mainCur)}</span></div>
      <div class="summary-row"><span class="label">Egresos</span><span class="value">${fmt(mainCash ? mainCash.out : 0, mainCur)}</span></div>
      <div class="summary-row"><span class="label">Saldo disponible</span><span class="value">${fmt(mainCash ? mainCash.balance : 0, mainCur)}</span></div>
    </div>

    <div class="card">
      <div class="card-title">📊 Presupuesto</div>
      <div class="summary-row"><span class="label">Presupuestado</span><span class="value">${fmt(totalBudget, 'BRL')}</span></div>
      <div class="summary-row"><span class="label">Gastado</span><span class="value">${fmt(totalSpent, 'BRL')}</span></div>
      <div class="summary-row"><span class="label">Disponible</span><span class="value">${fmt(totalBudget - totalSpent, 'BRL')}</span></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">📋 Tareas</div>
        <div class="stat ${overdueTasks ? 'danger' : ''}"><div class="stat-value">${pendingTasks}</div><div class="stat-label">${overdueTasks ? overdueTasks + ' vencidas' : 'pendientes'}</div></div>
      </div>
      <div class="card">
        <div class="card-title">🛒 Compras</div>
        <div class="stat coral"><div class="stat-value">${pendingPurchases}</div><div class="stat-label">pendientes</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🚗 Auto — mantenimientos pendientes</div>
      <div class="stat ${pendingMaintenance ? 'warn' : ''}"><div class="stat-value">${pendingMaintenance}</div><div class="stat-label">de ${State.Maintenance.length} ítems</div></div>
    </div>

    <div class="card">
      <div class="card-title">📅 Hoy tenemos planificado</div>
      ${todayItin.length ? todayItin.map((i) => `<div class="summary-row"><span class="label">${i.time || ''} ${esc(i.activity)}</span><span class="value">${esc(i.place || '')}</span></div>`).join('') : emptyState('Nada agendado para hoy todavía.')}
    </div>
  `;
}

// -------------------------------------------------------------- CAJA

function renderCaja() {
  const cash = State.cashSummary();
  const contrib = State.contributionsByTraveler();
  const currenciesUsed = CATEGORIES.currencies.filter((c) => cash[c] && (cash[c].in || cash[c].out));
  const shown = currenciesUsed.length ? currenciesUsed : ['ARS'];

  const cards = shown.map((cur) => `
    <div class="card">
      <div class="card-title">💰 Caja del viaje — ${cur}</div>
      <div class="summary-row"><span class="label">Ingresos</span><span class="value">${fmt(cash[cur].in, cur)}</span></div>
      <div class="summary-row"><span class="label">Egresos</span><span class="value">${fmt(cash[cur].out, cur)}</span></div>
      <div class="summary-row"><span class="label">Saldo disponible</span><span class="value">${fmt(cash[cur].balance, cur)}</span></div>
    </div>
  `).join('');

  const contribCard = `
    <div class="card">
      <div class="card-title">Aportes a la caja (informativo — no genera deudas)</div>
      ${Object.keys(contrib).length ? Object.keys(contrib).map((who) => `<div class="summary-row"><span class="label">${esc(who)}</span><span class="value">${fmt(contrib[who], 'ARS')}</span></div>`).join('') : emptyState('Todavía no se registraron aportes.')}
    </div>
  `;

  const list = [...State.CashTransactions].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const items = list.length ? list.map((t) => `
    <div class="item">
      <div class="item-top">
        <div>
          <div class="item-title">${esc(t.concept)}</div>
          <div class="item-meta">${fmtDate(t.date)} · ${esc(t.responsible || '')} ${t.category ? '· ' + esc(t.category) : ''}</div>
        </div>
        <div class="item-amount ${t.type === 'INGRESO' ? 'pos' : 'neg'}">${t.type === 'INGRESO' ? '+' : '−'}${fmt(t.amount, t.currency)}</div>
      </div>
      <div class="mt-8">
        <button class="btn ghost small" data-action="edit" data-sheet="CashTransactions" data-id="${t.id}">Editar</button>
        <button class="btn danger-ghost small" data-action="delete" data-sheet="CashTransactions" data-id="${t.id}">Eliminar</button>
      </div>
    </div>
  `).join('') : emptyState('Todavía no hay movimientos de caja.');

  return `
    ${cards}
    ${contribCard}
    <div class="section-head"><h2>Movimientos</h2><button class="btn primary small" data-action="new" data-sheet="CashTransactions">+ Movimiento</button></div>
    ${items}
  `;
}

// -------------------------------------------------------------- GASTOS

function renderGastos() {
  const byCat = State.expensesByCategory();
  const catRows = Object.keys(byCat).length ? Object.keys(byCat).map((cat) => `
    <div class="summary-row"><span class="label">${CATEGORY_ICON[cat] || '💳'} ${esc(cat)}</span><span class="value">${fmt(byCat[cat], 'BRL')}</span></div>
  `).join('') : emptyState('Sin gastos registrados.');

  const list = [...State.Expenses].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const items = list.length ? list.map((e) => `
    <div class="item">
      <div class="item-top">
        <div>
          <div class="item-title">${esc(e.description)}</div>
          <div class="item-meta">${fmtDate(e.date)} · ${CATEGORY_ICON[e.category] || ''} ${esc(e.category || '')}${e.subcategory ? ' · ' + esc(e.subcategory) : ''} · ${esc(e.responsible || '')}</div>
          ${e.paidFromCash ? '<span class="tag">Caja común</span>' : ''}
        </div>
        <div class="item-amount neg">${fmt(e.amount, e.currency)}</div>
      </div>
      <div class="mt-8">
        <button class="btn ghost small" data-action="edit" data-sheet="Expenses" data-id="${e.id}">Editar</button>
        <button class="btn danger-ghost small" data-action="delete" data-sheet="Expenses" data-id="${e.id}">Eliminar</button>
      </div>
    </div>
  `).join('') : emptyState('Todavía no hay gastos cargados.');

  return `
    <div class="card">
      <div class="card-title">Gasto por categoría</div>
      ${catRows}
    </div>
    <div class="section-head"><h2>Gastos</h2><button class="btn primary small" data-action="new" data-sheet="Expenses">+ Gasto</button></div>
    ${items}
  `;
}

// -------------------------------------------------------------- PRESUPUESTO

function renderPresupuesto() {
  const rows = State.budgetRows();
  const items = rows.length ? rows.map((b) => `
    <div class="item">
      <div class="item-top">
        <div class="item-title">${esc(b.category)}</div>
        <button class="btn ghost small" data-action="edit" data-sheet="Budget" data-id="${b.id}">Editar</button>
      </div>
      <div class="bar-track"><div class="bar-fill ${b.pct >= 100 ? 'over' : ''}" style="width:${b.pct}%"></div></div>
      <div class="summary-row"><span class="label">Presupuesto</span><span class="value">${fmt(b.budgetAmount, b.currency)}</span></div>
      <div class="summary-row"><span class="label">Gastado</span><span class="value">${fmt(b.gastado, b.currency)}</span></div>
      <div class="summary-row"><span class="label">Disponible</span><span class="value">${fmt(b.disponible, b.currency)}</span></div>
    </div>
  `).join('') : emptyState('Todavía no se definieron categorías de presupuesto.');

  return `
    <div class="section-head"><h2>Presupuesto</h2><button class="btn primary small" data-action="new" data-sheet="Budget">+ Categoría</button></div>
    ${items}
  `;
}

// -------------------------------------------------------------- ALOJAMIENTO

function renderAlojamiento() {
  const cfg = State.config;
  return `
    <div class="card">
      <div class="card-title">🏠 Estadía</div>
      <div class="summary-row"><span class="label">Dirección</span><span class="value">${esc(cfg.accommodationAddress || '—')}</span></div>
      <div class="summary-row"><span class="label">Check-in</span><span class="value">${cfg.checkIn ? cfg.checkIn.replace('T', ' ') : '—'}</span></div>
      <div class="summary-row"><span class="label">Check-out límite</span><span class="value">${cfg.checkOutLimit ? cfg.checkOutLimit.replace('T', ' ') : '—'}</span></div>
      <div class="summary-row"><span class="label">Salida prevista (no confundir con check-out)</span><span class="value">${cfg.plannedReturnDeparture ? cfg.plannedReturnDeparture.replace('T', ' ') : '—'}</span></div>
    </div>
    <div class="card">
      <div class="card-title">💳 Pago</div>
      <div class="summary-row"><span class="label">Precio total</span><span class="value">${fmt(cfg.accommodationTotalPrice, cfg.accommodationCurrency)}</span></div>
      <div class="summary-row"><span class="label">Seña</span><span class="value">${fmt(cfg.accommodationDeposit, cfg.accommodationCurrency)}</span></div>
      <div class="summary-row"><span class="label">Pagado</span><span class="value">${fmt(cfg.accommodationPaid, cfg.accommodationCurrency)}</span></div>
      <div class="summary-row"><span class="label">Pendiente</span><span class="value">${fmt(cfg.accommodationPending, cfg.accommodationCurrency)}</span></div>
      ${cfg.accommodationPaymentDate ? `<div class="summary-row"><span class="label">Fecha de pago</span><span class="value">${fmtDate(cfg.accommodationPaymentDate)}</span></div>` : ''}
    </div>
    <div class="card">
      <div class="card-title">Contacto</div>
      <div class="summary-row"><span class="label">Contacto</span><span class="value">${esc(cfg.accommodationContact || '—')}</span></div>
      <div class="summary-row"><span class="label">Huéspedes</span><span class="value">${esc(cfg.accommodationGuests || '—')}</span></div>
      <div class="summary-row"><span class="label">Código de confirmación</span><span class="value">${esc(cfg.accommodationConfirmationCode || '—')}</span></div>
      <div class="summary-row"><span class="label">Check-in</span><span class="value">${esc(cfg.accommodationCheckInMethod || '—')}</span></div>
      ${cfg.accommodationLink ? `<div class="mt-8"><a href="${esc(cfg.accommodationLink)}" target="_blank">Ver reserva ↗</a></div>` : ''}
    </div>
    ${cfg.accommodationCancellationPolicy ? `
    <div class="card">
      <div class="card-title">Política de cancelación</div>
      <p style="font-size:0.86rem;margin:0;">${esc(cfg.accommodationCancellationPolicy)}</p>
    </div>` : ''}
    <button class="btn block" data-action="edit-accommodation">Editar datos del alojamiento</button>
  `;
}

// -------------------------------------------------------------- RUTA

function renderRuta() {
  const cfg = State.config;
  const byLabel = {};
  State.Routes.forEach((r) => {
    byLabel[r.label] = byLabel[r.label] || [];
    byLabel[r.label].push(r);
  });
  const labels = Object.keys(byLabel);

  const compareCards = labels.length ? labels.map((label) => {
    const legs = byLabel[label];
    const totalKm = legs.reduce((s, r) => s + (Number(r.km) || 0), 0);
    const totalHours = legs.reduce((s, r) => s + (Number(r.hours) || 0), 0);
    const totalTolls = legs.reduce((s, r) => s + (Number(r.tolls) || 0), 0);
    const totalHotel = legs.reduce((s, r) => s + (Number(r.hotelCost) || 0), 0);
    const fuel = State.fuelCalc(totalKm);
    const totalCost = totalTolls + totalHotel + fuel.cost;
    const isEstimated = legs.some((r) => r.estimated);
    return `
      <div class="route-card">
        <h4>${esc(label)} ${isEstimated ? '<span class="tag">Estimado</span>' : ''}</h4>
        ${legs.map((r) => `<div class="summary-row"><span class="label">${esc(r.leg || '')}: ${esc(r.origin)} → ${r.waypoint ? esc(r.waypoint) + ' → ' : ''}${esc(r.destination)}</span><span class="value">${r.km || 0} km</span></div>`).join('')}
        <div class="summary-row"><span class="label">Tiempo total</span><span class="value">${totalHours} h</span></div>
        <div class="summary-row"><span class="label">Tanques</span><span class="value">${fuel.tanksRounded}</span></div>
        <div class="summary-row"><span class="label">Combustible</span><span class="value">${fmt(fuel.cost, 'ARS')}</span></div>
        <div class="summary-row"><span class="label">Peajes</span><span class="value">${fmt(totalTolls, 'ARS')}</span></div>
        <div class="summary-row"><span class="label">Hotel</span><span class="value">${fmt(totalHotel, 'ARS')}</span></div>
        <div class="summary-row"><span class="label"><strong>Costo total</strong></span><span class="value"><strong>${fmt(totalCost, 'ARS')}</strong></span></div>
        <a href="https://www.google.com/maps/dir/${encodeURIComponent(legs[0].origin)}/${legs[0].waypoint ? encodeURIComponent(legs[0].waypoint) + '/' : ''}${encodeURIComponent(legs[0].destination)}" target="_blank">Abrir en Google Maps ↗</a>
      </div>
    `;
  }).join('') : emptyState('Todavía no cargaste tramos de ruta para comparar.');

  const list = State.Routes.map((r) => `
    <div class="item">
      <div class="item-top">
        <div>
          <div class="item-title">${esc(r.label)} — ${esc(r.leg || '')}</div>
          <div class="item-meta">${esc(r.origin)} ${r.waypoint ? '→ ' + esc(r.waypoint) : ''} → ${esc(r.destination)}</div>
        </div>
        <div class="item-amount">${r.km || 0} km</div>
      </div>
      <div class="mt-8">
        <button class="btn ghost small" data-action="edit" data-sheet="Routes" data-id="${r.id}">Editar</button>
        <button class="btn danger-ghost small" data-action="delete" data-sheet="Routes" data-id="${r.id}">Eliminar</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="card">
      <div class="card-title">🚗 Vehículo</div>
      <div class="summary-row"><span class="label">Auto</span><span class="value">${esc(cfg.vehicleBrand)} ${esc(cfg.vehicleModel)} (${esc(cfg.vehicleYear)})</span></div>
      <div class="summary-row"><span class="label">Combustible</span><span class="value">${esc(cfg.vehicleFuelType)}</span></div>
      <div class="summary-row"><span class="label">Autonomía por tanque</span><span class="value">${cfg.tankRangeKm} km</span></div>
      <div class="summary-row"><span class="label">Precio tanque lleno</span><span class="value">${fmt(cfg.tankCostARS, 'ARS')}</span></div>
      <div class="summary-row"><span class="label">Margen de seguridad</span><span class="value">${cfg.fuelMarginPercent}%</span></div>
      <button class="btn ghost small mt-8" data-action="edit-vehicle">Editar vehículo / combustible</button>
    </div>

    <div class="section-head"><h2>Comparador de rutas</h2></div>
    <div class="route-compare">${compareCards}</div>

    <div class="section-head mt-16"><h2>Tramos cargados</h2><button class="btn primary small" data-action="new" data-sheet="Routes">+ Tramo</button></div>
    ${list || emptyState('Agregá tramos para armar y comparar rutas.')}
  `;
}

// -------------------------------------------------------------- TAREAS

function renderTareas() {
  const today = new Date().toISOString().slice(0, 10);
  const list = [...State.Tasks].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  const items = list.length ? list.map((t) => `
    <div class="item">
      <div class="item-top">
        <div>
          <div class="item-title">${esc(t.task)}</div>
          <div class="item-meta">${esc(t.responsible || '')} ${t.dueDate ? '· vence ' + fmtDate(t.dueDate) : ''} ${t.priority ? '· prioridad ' + esc(t.priority) : ''}</div>
          <span class="tag status-${(t.status || '').replace(' ', '-')}">${esc(t.status || 'Pendiente')}${t.dueDate && t.dueDate < today && t.status !== 'Hecho' ? ' · vencida' : ''}</span>
        </div>
        ${t.cost ? `<div class="item-amount">${fmt(t.cost, 'ARS')}</div>` : ''}
      </div>
      <div class="mt-8">
        <button class="btn ghost small" data-action="edit" data-sheet="Tasks" data-id="${t.id}">Editar</button>
        <button class="btn danger-ghost small" data-action="delete" data-sheet="Tasks" data-id="${t.id}">Eliminar</button>
      </div>
    </div>
  `).join('') : emptyState('Sin tareas cargadas.');

  return `
    <div class="section-head"><h2>Tareas</h2><button class="btn primary small" data-action="new" data-sheet="Tasks">+ Tarea</button></div>
    ${items}
  `;
}

// -------------------------------------------------------------- COMPRAS

function renderCompras() {
  const list = [...State.Purchases].sort((a, b) => (a.status || '').localeCompare(b.status || ''));
  const items = list.length ? list.map((p) => `
    <div class="item">
      <div class="item-top">
        <div>
          <div class="item-title">${esc(p.product)} ${p.quantity ? '× ' + p.quantity : ''}</div>
          <div class="item-meta">${CATEGORY_ICON[p.category] || '🛍️'} ${esc(p.category || '')} ${p.responsible ? '· ' + esc(p.responsible) : ''}</div>
          <span class="tag status-${(p.status || '').replace(' ', '-')}">${esc(p.status || 'Pendiente')}</span>
        </div>
        <div class="item-amount">${p.realPrice ? fmt(p.realPrice, 'BRL') : (p.estPrice ? '~' + fmt(p.estPrice, 'BRL') : '')}</div>
      </div>
      <div class="mt-8">
        <button class="btn ghost small" data-action="edit" data-sheet="Purchases" data-id="${p.id}">Editar</button>
        <button class="btn danger-ghost small" data-action="delete" data-sheet="Purchases" data-id="${p.id}">Eliminar</button>
      </div>
    </div>
  `).join('') : emptyState('Sin compras cargadas.');

  return `
    <div class="section-head"><h2>Compras</h2><button class="btn primary small" data-action="new" data-sheet="Purchases">+ Compra</button></div>
    ${items}
  `;
}

// -------------------------------------------------------------- MANTENIMIENTO

function renderMantenimiento() {
  const list = State.Maintenance;
  const items = list.length ? list.map((m) => `
    <div class="item">
      <div class="item-top">
        <div>
          <div class="item-title">${esc(m.item)}</div>
          <div class="item-meta">${m.responsible ? esc(m.responsible) + ' · ' : ''}${m.dueDate ? 'vence ' + fmtDate(m.dueDate) : ''}</div>
          <span class="tag status-${(m.status || '').replace(' ', '-')}">${esc(m.status || 'Pendiente')}</span>
        </div>
        ${m.realCost || m.estCost ? `<div class="item-amount">${fmt(m.realCost || m.estCost, 'ARS')}</div>` : ''}
      </div>
      <div class="mt-8">
        <button class="btn ghost small" data-action="edit" data-sheet="Maintenance" data-id="${m.id}">Editar</button>
        <button class="btn danger-ghost small" data-action="delete" data-sheet="Maintenance" data-id="${m.id}">Eliminar</button>
      </div>
    </div>
  `).join('') : emptyState('Todavía no cargaste el checklist de puesta a punto.');

  return `
    <div class="section-head"><h2>Puesta a punto del auto</h2><button class="btn primary small" data-action="new" data-sheet="Maintenance">+ Ítem</button></div>
    ${items}
  `;
}

// -------------------------------------------------------------- ITINERARIO

function renderItinerario() {
  const dates = [...new Set(State.Itinerary.map((i) => i.date))].sort();
  if (!dates.length) {
    return `
      <div class="section-head"><h2>Itinerario</h2><button class="btn primary small" data-action="new" data-sheet="Itinerary">+ Actividad</button></div>
      ${emptyState('Todavía no hay actividades cargadas.')}
    `;
  }
  const days = dates.map((d) => {
    const items = State.itineraryForDate(d);
    return `
      <div class="card">
        <div class="card-title">${fmtDate(d)}</div>
        ${items.map((i) => `
          <div class="item">
            <div class="item-top">
              <div>
                <div class="item-title">${CATEGORY_ICON[i.category] || ''} ${esc(i.activity)}</div>
                <div class="item-meta">${i.time || ''} ${i.place ? '· ' + esc(i.place) : ''} ${i.responsible ? '· ' + esc(i.responsible) : ''}</div>
                <span class="tag status-${(i.status || '').replace(' ', '-')}">${esc(i.status || 'Planeado')}</span>
              </div>
              ${i.estCost ? `<div class="item-amount">${fmt(i.realCost || i.estCost, 'BRL')}</div>` : ''}
            </div>
            <div class="mt-8">
              <button class="btn ghost small" data-action="edit" data-sheet="Itinerary" data-id="${i.id}">Editar</button>
              <button class="btn danger-ghost small" data-action="delete" data-sheet="Itinerary" data-id="${i.id}">Eliminar</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');

  return `
    <div class="section-head"><h2>Itinerario</h2><button class="btn primary small" data-action="new" data-sheet="Itinerary">+ Actividad</button></div>
    ${days}
  `;
}

// -------------------------------------------------------------- MÁS (hub)

function renderMas() {
  const sections = [
    { key: 'presupuesto', icon: '📊', label: 'Presupuesto' },
    { key: 'alojamiento', icon: '🏠', label: 'Alojamiento' },
    { key: 'ruta', icon: '🚗', label: 'Ruta y combustible' },
    { key: 'compras', icon: '🛒', label: 'Compras' },
    { key: 'mantenimiento', icon: '🔧', label: 'Puesta a punto del auto' },
    { key: 'equipaje', icon: '🧳', label: 'Equipaje' },
    { key: 'inventario', icon: '🎒', label: 'Cosas que ya tenemos' },
    { key: 'documentos', icon: '📄', label: 'Documentación' },
    { key: 'resumen', icon: '🇧🇷', label: 'Resumen del viaje' },
    { key: 'config', icon: '⚙️', label: 'Configuración del viaje' }
  ];
  return `
    <div class="section-head"><h2>Más</h2></div>
    ${sections.map((s) => `
      <div class="item" data-action="goto" data-view="${s.key}" style="cursor:pointer">
        <div class="item-title">${s.icon} ${s.label}</div>
      </div>
    `).join('')}
  `;
}

// -------------------------------------------------------------- EQUIPAJE

function renderEquipaje() {
  const groups = ['Matias', 'Juli', 'Compartido'];
  const body = groups.map((g) => {
    const items = State.Luggage.filter((l) => l.person === g);
    return `
      <div class="card">
        <div class="card-title">${g}</div>
        ${items.length ? items.map((l) => `
          <div class="item">
            <div class="item-top">
              <div class="item-title">${l.packed ? '☑' : '☐'} ${esc(l.item)} ${l.quantity ? '× ' + l.quantity : ''}</div>
              <div>
                <button class="btn ghost small" data-action="toggle-packed" data-id="${l.id}" data-packed="${!l.packed}">${l.packed ? 'Desmarcar' : 'Listo'}</button>
              </div>
            </div>
            <div class="mt-8">
              <button class="btn ghost small" data-action="edit" data-sheet="Luggage" data-id="${l.id}">Editar</button>
              <button class="btn danger-ghost small" data-action="delete" data-sheet="Luggage" data-id="${l.id}">Eliminar</button>
            </div>
          </div>
        `).join('') : emptyState('Nada cargado todavía.')}
      </div>
    `;
  }).join('');
  return `
    <div class="section-head"><h2>Equipaje</h2><button class="btn primary small" data-action="new" data-sheet="Luggage">+ Elemento</button></div>
    ${body}
  `;
}

// -------------------------------------------------------------- INVENTARIO

function renderInventario() {
  const items = State.Inventory.length ? State.Inventory.map((i) => `
    <div class="item">
      <div class="item-top">
        <div>
          <div class="item-title">${esc(i.item)} ${i.quantity ? '× ' + i.quantity : ''}</div>
          <div class="item-meta">${esc(i.owner || '')} ${i.category ? '· ' + esc(i.category) : ''} ${i.status ? '· ' + esc(i.status) : ''}</div>
        </div>
      </div>
      <div class="mt-8">
        <button class="btn ghost small" data-action="edit" data-sheet="Inventory" data-id="${i.id}">Editar</button>
        <button class="btn danger-ghost small" data-action="delete" data-sheet="Inventory" data-id="${i.id}">Eliminar</button>
      </div>
    </div>
  `).join('') : emptyState('Sin elementos cargados.');
  return `
    <div class="section-head"><h2>Cosas que ya tenemos</h2><button class="btn primary small" data-action="new" data-sheet="Inventory">+ Elemento</button></div>
    ${items}
  `;
}

// -------------------------------------------------------------- DOCUMENTOS

function renderDocumentos() {
  const items = State.Documents.length ? State.Documents.map((d) => `
    <div class="item">
      <div class="item-top">
        <div class="item-title">${esc(d.name)}</div>
        <span class="tag status-${(d.status || '').replace(' ', '-')}">${esc(d.status || 'Pendiente')}</span>
      </div>
      <div class="item-meta">${esc(d.category || '')}</div>
      <div class="mt-8">
        <button class="btn ghost small" data-action="edit" data-sheet="Documents" data-id="${d.id}">Editar</button>
        <button class="btn danger-ghost small" data-action="delete" data-sheet="Documents" data-id="${d.id}">Eliminar</button>
      </div>
    </div>
  `).join('') : emptyState('Sin checklist de documentación todavía.');
  return `
    <div class="section-head"><h2>Documentación</h2><button class="btn primary small" data-action="new" data-sheet="Documents">+ Documento</button></div>
    ${items}
    <div class="card mt-16 muted" style="font-size:0.82rem">Los requisitos de frontera cambian con el tiempo — antes de viajar confirmá los vigentes en fuentes oficiales (Migraciones / Cancillería).</div>
  `;
}

// -------------------------------------------------------------- RESUMEN

function renderResumen() {
  const phase = State.tripPhase();
  const cash = State.cashSummary();
  const totalExpBRL = State.totalExpenses('BRL');
  const totalExpARS = State.totalExpenses('ARS');
  const byCat = State.expensesByCategory();
  const routeIda = State.Routes.filter((r) => r.leg === 'Ida');
  const totalKm = routeIda.reduce((s, r) => s + (Number(r.km) || 0), 0);
  const fuel = totalKm > 0 ? State.fuelCalc(totalKm) : null;

  return `
    ${phase !== 'post' ? `<div class="card center muted">Este resumen se completa del todo al finalizar el viaje. Por ahora muestra los datos cargados hasta hoy.</div>` : ''}
    <div class="card">
      <div class="card-title">🚗 Distancia total</div>
      <div class="stat-value">${totalKm || '—'} km</div>
    </div>
    <div class="card">
      <div class="card-title">⛽ Combustible</div>
      ${fuel ? `<div class="summary-row"><span class="label">Tanques</span><span class="value">${fuel.tanksRounded}</span></div><div class="summary-row"><span class="label">Costo</span><span class="value">${fmt(fuel.cost, 'ARS')}</span></div>` : emptyState('Sin ruta cargada.')}
    </div>
    <div class="card">
      <div class="card-title">💳 Gasto total</div>
      <div class="summary-row"><span class="label">En BRL</span><span class="value">${fmt(totalExpBRL, 'BRL')}</span></div>
      <div class="summary-row"><span class="label">En ARS</span><span class="value">${fmt(totalExpARS, 'ARS')}</span></div>
      ${Object.keys(byCat).map((c) => `<div class="summary-row"><span class="label">${CATEGORY_ICON[c] || ''} ${esc(c)}</span><span class="value">${fmt(byCat[c], 'BRL')}</span></div>`).join('')}
    </div>
    <div class="card">
      <div class="card-title">💰 Caja</div>
      ${CATEGORIES.currencies.filter((c) => cash[c].in || cash[c].out).map((c) => `
        <div class="summary-row"><span class="label">Ingresos ${c}</span><span class="value">${fmt(cash[c].in, c)}</span></div>
        <div class="summary-row"><span class="label">Egresos ${c}</span><span class="value">${fmt(cash[c].out, c)}</span></div>
        <div class="summary-row"><span class="label"><strong>Saldo final ${c}</strong></span><span class="value"><strong>${fmt(cash[c].balance, c)}</strong></span></div>
      `).join('')}
    </div>
  `;
}

// -------------------------------------------------------------- CONFIG

function renderConfig() {
  const cfg = State.config;
  return `
    <div class="section-head"><h2>Configuración del viaje</h2></div>
    <div class="card">
      <div class="card-title">Datos generales</div>
      <div class="summary-row"><span class="label">Viajeros</span><span class="value">${esc(cfg.travelerA)} y ${esc(cfg.travelerB)}</span></div>
      <div class="summary-row"><span class="label">Origen</span><span class="value">${esc(cfg.origin)}</span></div>
      <div class="summary-row"><span class="label">Destino</span><span class="value">${esc(cfg.destination)}</span></div>
      <div class="summary-row"><span class="label">Salida</span><span class="value">${fmtDate(cfg.departureDate)} ${cfg.departureTime || ''}</span></div>
    </div>
    <button class="btn block" data-action="edit-trip">Editar datos generales</button>
    <button class="btn block ghost mt-8" data-action="edit-vehicle">Editar vehículo / combustible</button>
    <button class="btn block ghost mt-8" data-action="edit-accommodation">Editar alojamiento</button>
  `;
}
