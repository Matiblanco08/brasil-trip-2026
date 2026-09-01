// ==========================================================================
// STATE — datos en memoria + cálculos derivados
// ==========================================================================

const State = {
  config: {},
  CashTransactions: [],
  Expenses: [],
  Budget: [],
  Routes: [],
  Tasks: [],
  Purchases: [],
  Maintenance: [],
  Itinerary: [],
  Luggage: [],
  Inventory: [],
  Documents: [],
  Travelers: [],
  loaded: false,

  async load() {
    const data = await Api.getAll();
    Object.keys(data).forEach((k) => {
      if (k === 'config') this.config = data.config;
      else this[k] = data[k] || [];
    });
    this.loaded = true;
  },

  // ---- helpers de fecha ----
  daysUntil(dateStr) {
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target - t0) / 86400000);
  },

  tripPhase() {
    const dep = this.config.departureDate;
    const ret = this.config.checkOutLimit ? this.config.checkOutLimit.slice(0, 10) : null;
    if (!dep) return 'pre';
    const days = this.daysUntil(dep);
    if (days > 0) return 'pre';
    if (ret && this.daysUntil(ret) < 0) return 'post';
    if (days === 0) return 'start';
    return 'during';
  },

  // ---- caja común ----
  cashSummary() {
    const byCurrency = {};
    CATEGORIES.currencies.forEach((c) => (byCurrency[c] = { in: 0, out: 0 }));
    this.CashTransactions.forEach((t) => {
      const cur = t.currency || 'ARS';
      if (!byCurrency[cur]) byCurrency[cur] = { in: 0, out: 0 };
      const amt = Number(t.amount) || 0;
      if (t.type === 'INGRESO') byCurrency[cur].in += amt;
      else byCurrency[cur].out += amt;
    });
    Object.keys(byCurrency).forEach((cur) => {
      byCurrency[cur].balance = byCurrency[cur].in - byCurrency[cur].out;
    });
    return byCurrency;
  },

  contributionsByTraveler() {
    const out = {};
    this.CashTransactions.filter((t) => t.type === 'INGRESO').forEach((t) => {
      const who = t.responsible || 'Sin asignar';
      out[who] = (out[who] || 0) + (Number(t.amount) || 0);
    });
    return out;
  },

  // ---- gastos / presupuesto ----
  expensesByCategory() {
    const out = {};
    this.Expenses.forEach((e) => {
      const cat = e.category || 'Otros';
      out[cat] = (out[cat] || 0) + (Number(e.amount) || 0);
    });
    return out;
  },

  totalExpenses(currency) {
    return this.Expenses
      .filter((e) => !currency || e.currency === currency)
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  },

  budgetRows() {
    const spent = this.expensesByCategory();
    return this.Budget.map((b) => {
      const gastado = spent[b.category] || 0;
      const presupuesto = Number(b.budgetAmount) || 0;
      return {
        ...b,
        gastado,
        disponible: presupuesto - gastado,
        pct: presupuesto > 0 ? Math.min(100, Math.round((gastado / presupuesto) * 100)) : 0
      };
    });
  },

  // ---- combustible ----
  fuelCalc(distanceKm, marginPercent) {
    const range = Number(this.config.tankRangeKm) || 600;
    const tankCost = Number(this.config.tankCostARS) || 100000;
    const margin = marginPercent !== undefined ? Number(marginPercent) : Number(this.config.fuelMarginPercent) || 0;
    const distanceWithMargin = distanceKm * (1 + margin / 100);
    const tanks = distanceWithMargin / range;
    const cost = tanks * tankCost;
    const costPerKm = distanceKm > 0 ? cost / distanceKm : 0;
    return {
      distanceKm,
      distanceWithMargin: Math.round(distanceWithMargin),
      tanks: Math.round(tanks * 100) / 100,
      tanksRounded: Math.ceil(tanks),
      cost: Math.round(cost),
      costPerKm: Math.round(costPerKm)
    };
  },

  // ---- tareas / compras / mantenimiento pendientes ----
  pendingTasks() {
    return this.Tasks.filter((t) => t.status !== 'Hecho' && t.status !== 'Cancelado');
  },
  overdueTasks() {
    const today = new Date().toISOString().slice(0, 10);
    return this.pendingTasks().filter((t) => t.dueDate && t.dueDate < today);
  },
  pendingPurchases() {
    return this.Purchases.filter((p) => p.status === 'Pendiente' || p.status === 'Conseguir');
  },
  pendingMaintenance() {
    return this.Maintenance.filter((m) => m.status !== 'Hecho');
  },

  // ---- itinerario ----
  itineraryForDate(dateStr) {
    return this.Itinerary
      .filter((i) => i.date === dateStr)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  },
  todayItinerary() {
    const today = new Date().toISOString().slice(0, 10);
    return this.itineraryForDate(today);
  }
};
