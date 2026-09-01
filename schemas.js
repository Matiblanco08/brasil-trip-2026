// ==========================================================================
// SCHEMAS — definen los formularios genéricos de alta/edición por hoja
// ==========================================================================

const FORM_SCHEMAS = {
  CashTransactions: {
    title: 'Movimiento de caja',
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'type', label: 'Tipo', type: 'select', options: ['INGRESO', 'EGRESO'], required: true },
      { name: 'concept', label: 'Concepto', type: 'text', required: true },
      { name: 'category', label: 'Categoría', type: 'text', placeholder: 'Aporte, Combustible, Supermercado…' },
      { name: 'amount', label: 'Monto', type: 'number', required: true },
      { name: 'currency', label: 'Moneda', type: 'select', options: CATEGORIES.currencies },
      { name: 'responsible', label: 'Quién lo registró', type: 'select', options: CATEGORIES.responsibleOptions },
      { name: 'paymentMethod', label: 'Medio de pago', type: 'text' },
      { name: 'receipt', label: 'Comprobante (link)', type: 'text' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  Expenses: {
    title: 'Gasto',
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'description', label: 'Descripción', type: 'text', required: true },
      { name: 'category', label: 'Categoría', type: 'select', options: Object.keys(CATEGORIES.expense) },
      { name: 'subcategory', label: 'Subcategoría', type: 'text' },
      { name: 'amount', label: 'Monto', type: 'number', required: true },
      { name: 'currency', label: 'Moneda', type: 'select', options: CATEGORIES.currencies },
      { name: 'paidFromCash', label: 'Pagado desde la caja común', type: 'checkbox' },
      { name: 'responsible', label: 'Quién lo cargó', type: 'select', options: CATEGORIES.responsibleOptions },
      { name: 'paymentMethod', label: 'Medio de pago', type: 'text' },
      { name: 'receipt', label: 'Comprobante (link)', type: 'text' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  Budget: {
    title: 'Presupuesto de categoría',
    fields: [
      { name: 'category', label: 'Categoría', type: 'text', required: true },
      { name: 'budgetAmount', label: 'Presupuesto', type: 'number', required: true },
      { name: 'currency', label: 'Moneda', type: 'select', options: CATEGORIES.currencies }
    ]
  },
  Routes: {
    title: 'Tramo de ruta',
    fields: [
      { name: 'label', label: 'Nombre (Ruta A, Ruta B…)', type: 'text', required: true },
      { name: 'leg', label: 'Tramo', type: 'select', options: ['Ida', 'Vuelta'] },
      { name: 'origin', label: 'Origen', type: 'text', required: true },
      { name: 'waypoint', label: 'Parada intermedia', type: 'text' },
      { name: 'destination', label: 'Destino', type: 'text', required: true },
      { name: 'km', label: 'Kilómetros', type: 'number', required: true },
      { name: 'hours', label: 'Horas estimadas', type: 'number' },
      { name: 'tolls', label: 'Peajes', type: 'number' },
      { name: 'hotelCost', label: 'Costo de hotel (si hace noche)', type: 'number' },
      { name: 'notes', label: 'Notas', type: 'textarea' },
      { name: 'estimated', label: 'Datos estimados (no confirmados)', type: 'checkbox' }
    ]
  },
  Tasks: {
    title: 'Tarea',
    fields: [
      { name: 'task', label: 'Tarea', type: 'text', required: true },
      { name: 'category', label: 'Categoría', type: 'text' },
      { name: 'responsible', label: 'Responsable', type: 'select', options: CATEGORIES.responsibleOptions },
      { name: 'dueDate', label: 'Fecha límite', type: 'date' },
      { name: 'priority', label: 'Prioridad', type: 'select', options: CATEGORIES.taskPriority },
      { name: 'status', label: 'Estado', type: 'select', options: CATEGORIES.taskStatus },
      { name: 'cost', label: 'Costo estimado', type: 'number' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  Purchases: {
    title: 'Compra',
    fields: [
      { name: 'product', label: 'Producto', type: 'text', required: true },
      { name: 'category', label: 'Categoría', type: 'select', options: CATEGORIES.purchase },
      { name: 'quantity', label: 'Cantidad', type: 'number' },
      { name: 'estPrice', label: 'Precio estimado', type: 'number' },
      { name: 'realPrice', label: 'Precio real', type: 'number' },
      { name: 'responsible', label: 'Responsable', type: 'select', options: CATEGORIES.responsibleOptions },
      { name: 'dueDate', label: 'Fecha límite', type: 'date' },
      { name: 'status', label: 'Estado', type: 'select', options: CATEGORIES.purchaseStatus }
    ]
  },
  Maintenance: {
    title: 'Ítem de mantenimiento',
    fields: [
      { name: 'item', label: 'Ítem', type: 'text', required: true, list: CATEGORIES.maintenanceItems },
      { name: 'status', label: 'Estado', type: 'select', options: CATEGORIES.maintenanceStatus },
      { name: 'date', label: 'Fecha realizado', type: 'date' },
      { name: 'mileage', label: 'Kilometraje', type: 'number' },
      { name: 'responsible', label: 'Responsable', type: 'select', options: CATEGORIES.responsibleOptions },
      { name: 'estCost', label: 'Costo estimado', type: 'number' },
      { name: 'realCost', label: 'Costo real', type: 'number' },
      { name: 'dueDate', label: 'Fecha límite', type: 'date' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  Itinerary: {
    title: 'Actividad del itinerario',
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'place', label: 'Lugar', type: 'text' },
      { name: 'activity', label: 'Actividad', type: 'text', required: true },
      { name: 'time', label: 'Hora', type: 'time' },
      { name: 'duration', label: 'Duración', type: 'text', placeholder: 'ej: 2h' },
      { name: 'category', label: 'Categoría', type: 'select', options: CATEGORIES.itineraryCategory },
      { name: 'responsible', label: 'Responsable', type: 'select', options: CATEGORIES.responsibleOptions },
      { name: 'estCost', label: 'Costo estimado', type: 'number' },
      { name: 'realCost', label: 'Costo real', type: 'number' },
      { name: 'status', label: 'Estado', type: 'select', options: ['Planeado', 'Hecho', 'Cancelado'] },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  Luggage: {
    title: 'Elemento de equipaje',
    fields: [
      { name: 'item', label: 'Elemento', type: 'text', required: true },
      { name: 'quantity', label: 'Cantidad', type: 'number' },
      { name: 'person', label: 'Persona', type: 'select', options: ['Matias', 'Juli', 'Compartido'] },
      { name: 'category', label: 'Categoría', type: 'text' },
      { name: 'packed', label: 'Preparado', type: 'checkbox' }
    ]
  },
  Inventory: {
    title: 'Cosa que ya tenemos',
    fields: [
      { name: 'item', label: 'Elemento', type: 'text', required: true },
      { name: 'quantity', label: 'Cantidad', type: 'number' },
      { name: 'owner', label: 'Quién lo tiene', type: 'select', options: CATEGORIES.responsibleOptions },
      { name: 'category', label: 'Categoría', type: 'text' },
      { name: 'status', label: 'Estado', type: 'text' },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  },
  Documents: {
    title: 'Documento',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'category', label: 'Categoría', type: 'select', options: CATEGORIES.documentCategory },
      { name: 'status', label: 'Estado', type: 'select', options: ['Pendiente', 'Listo'] },
      { name: 'notes', label: 'Notas', type: 'textarea' }
    ]
  }
};
