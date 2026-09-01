// ==========================================================================
// CONFIGURACIÓN — completar después de desplegar el Apps Script
// ==========================================================================

// Pegar acá la URL "/exec" que entrega Apps Script al implementar como
// aplicación web (Extensiones > Apps Script > Implementar > Nueva implementación).
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwpA_jbeb-tkmNbNEvGYskYgTCuI3oecnA9T5oddvZIYehCZPFDkacBl6mX2OFDaxRNqw/exec';

// Google Maps: si más adelante se activa la API de rutas/distancias,
// la clave se carga acá — nunca hardcodeada en el HTML.
// 1) Activar "Directions API" y "Distance Matrix API" en Google Cloud Console.
// 2) Restringir la clave por referer (dominio de GitHub Pages).
// 3) Copiar public/js/maps-key.example.js a public/js/maps-key.js (gitignored)
//    y pegar la clave ahí. Mientras tanto, la app usa links a Google Maps.
const GOOGLE_MAPS_API_KEY = (typeof MAPS_KEY !== 'undefined') ? MAPS_KEY : '';

const CATEGORIES = {
  cash: ['Aporte', 'Reintegro', 'Ajuste', 'Otro'],
  expense: {
    'Auto': ['Combustible', 'Peajes', 'Mantenimiento', 'Estacionamiento', 'Lavado'],
    'Alojamiento': ['Casa', 'Hotel', 'Limpieza', 'Depósito'],
    'Comida': ['Supermercado', 'Restaurante', 'Delivery', 'Cafés'],
    'Playa': ['General'],
    'Turismo': ['General'],
    'Compras': ['General'],
    'Servicios': ['General'],
    'Otros': ['General']
  },
  purchase: ['Supermercado', 'Playa', 'Auto', 'Viaje', 'Casa', 'Higiene', 'Otros'],
  purchaseStatus: ['Pendiente', 'Comprado', 'Ya tenemos', 'Conseguir', 'Cancelado'],
  taskStatus: ['Pendiente', 'En proceso', 'Hecho', 'Cancelado'],
  taskPriority: ['Baja', 'Media', 'Alta'],
  responsibleOptions: ['Matias', 'Juli', 'Ambos'],
  itineraryCategory: ['Viaje', 'Playa', 'Gastronomía', 'Turismo', 'Actividad', 'Compras', 'Alojamiento', 'Descanso', 'Pareja', 'Otros'],
  maintenanceItems: ['Aceite', 'Filtros', 'Frenos', 'Neumáticos', 'Auxilio', 'Batería', 'Luces', 'Refrigerante', 'Aire acondicionado', 'Suspensión', 'Dirección', 'Alineación', 'Balanceo', 'Escobillas', 'Correa', 'Documentación', 'Seguro'],
  maintenanceStatus: ['Pendiente', 'Programado', 'Hecho'],
  documentCategory: ['Personal', 'Vehículo', 'Frontera', 'Reservas', 'Otros'],
  currencies: ['ARS', 'BRL', 'USD']
};

const CURRENCY_SYMBOL = { ARS: '$', BRL: 'R$', USD: 'US$' };

const CATEGORY_ICON = {
  'Auto': '🚗', 'Alojamiento': '🏠', 'Comida': '🍽️', 'Playa': '🏖️',
  'Turismo': '🌴', 'Compras': '🛍️', 'Servicios': '📱', 'Otros': '💳'
};
