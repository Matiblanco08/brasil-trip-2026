# 🇧🇷 Brasil 2026 — Travel ERP

Centro de control del viaje de Matias y Juli a Praia Brava, Florianópolis
(19/11/2026 → 30/11/2026). PWA para usar durante meses de planificación y
también desde el celular durante el viaje.

**Stack:** Google Sheets (base de datos) + Google Apps Script (backend,
patrón JSONP) + HTML/CSS/JS estático en GitHub Pages — igual arquitectura
que el resto de los proyectos (GG Taller, BC Salud, Bunker GN).

## Qué incluye esta primera versión (MVP)

Funcional de punta a punta:
- Dashboard / centro de control con cuenta regresiva grande
- Caja común del viaje (ingresos, egresos, saldo — **sin división de gastos
  ni deudas entre los dos**, tal como se pidió)
- Gastos por categoría
- Presupuesto vs. gasto real
- Alojamiento (check-in, check-out límite vs. salida planificada, pagos)
- Ruta, cálculo de combustible (autonomía/tanque, margen de seguridad) y
  comparador de rutas
- Tareas, Compras, Puesta a punto del auto, Itinerario por día
- Equipaje, Inventario ("cosas que ya tenemos"), Documentación
- Resumen del viaje (distancia, combustible, gasto total, saldo final)
- Modo "Más" con acceso a todas las secciones secundarias

Google Maps: por ahora se integra con **links directos** (botón "Abrir en
Google Maps" en el comparador de rutas) — no inventa distancias, peajes ni
tiempos. La integración con la API completa (Directions/Distance Matrix)
queda preparada para activarse después (ver `.env.example`).

## 1. Crear la base de datos (Google Sheets)

1. Crear una Google Sheet nueva y vacía (ej: "Brasil 2026 - DB").
2. Extensiones → Apps Script.
3. Borrar el contenido default y pegar el contenido de `apps-script/Code.gs`.
4. En el editor de Apps Script, ejecutar la función `setupSheets` una vez
   (botón ▶). La primera vez va a pedir autorización — aceptar.
5. Esto crea todas las hojas (Config, CashTransactions, Expenses, Budget,
   Routes, Tasks, Purchases, Maintenance, Itinerary, Luggage, Inventory,
   Documents, Travelers) con sus encabezados y datos iniciales (fechas,
   auto, alojamiento) ya cargados según lo que se especificó.

## 2. Publicar el backend

1. En Apps Script: Implementar → Nueva implementación.
2. Tipo: **Aplicación web**.
3. Ejecutar como: **Yo**.
4. Quién tiene acceso: **Cualquier usuario** (necesario para que el JSONP
   funcione sin login).
5. Implementar. Copiar la URL que termina en `/exec`.

Cada vez que se modifique `Code.gs`, hay que crear una **nueva
implementación** (o editar la existente) para que los cambios tomen efecto.

## 3. Configurar el frontend

1. Abrir `public/js/config.js`.
2. Reemplazar `APPS_SCRIPT_URL` por la URL `/exec` del paso anterior.
3. (Opcional, más adelante) para Google Maps API completa: copiar
   `public/js/maps-key.example.js` a `public/js/maps-key.js` y completar la
   clave — activando antes "Directions API" y "Distance Matrix API" en
   Google Cloud Console y restringiendo la clave por dominio.

## 4. Subir a GitHub y publicar

```bash
cd brasil-trip-2026
git init
git add .
git commit -m "Brasil 2026 Travel ERP — MVP"
git branch -M main
git remote add origin https://github.com/Matiblanco08/brasil-trip-2026.git
git push -u origin main
```

En GitHub: Settings → Pages → Deploy from branch → `main` → carpeta `/public`.
La app queda en `https://matiblanco08.github.io/brasil-trip-2026/`.

Desde el celular: abrir esa URL en Chrome → menú → "Agregar a pantalla de
inicio" para instalarla como app (PWA).

## Estructura del proyecto

```
brasil-trip-2026/
├── apps-script/
│   └── Code.gs              # backend: CRUD genérico sobre Sheets, JSONP
├── public/                  # esto es lo que se publica en GitHub Pages
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js                 # cache del shell para uso offline básico
│   ├── css/style.css
│   └── js/
│       ├── config.js          # URL del Apps Script + catálogos
│       ├── schemas.js         # formularios genéricos por entidad
│       ├── api.js             # llamadas JSONP
│       ├── state.js           # datos en memoria + cálculos (caja, combustible, presupuesto)
│       ├── views.js           # HTML de cada sección
│       └── app.js             # router y eventos
├── .env.example
├── .gitignore
└── README.md
```

## Cómo se resuelve la regla de la caja común

No existe "quién le debe a quién". Cada movimiento de caja es un INGRESO o
un EGRESO de la caja compartida; el campo "responsable" solo indica quién
lo registró, nunca genera una deuda. Los aportes de cada uno se muestran
únicamente como dato informativo (sección Caja), sin ningún cálculo de
compensación.

## Próximos pasos sugeridos (Prioridad 2/3, no incluidos aún)

- Integración completa de Google Maps (Directions/Distance Matrix API) para
  autocompletar km, tiempo y peajes en vez de cargarlos a mano
- Cotizaciones automáticas de USD/BRL
- Modo viaje con geolocalización y notificaciones
- Información turística de Florianópolis

Estos quedaron fuera del MVP a propósito, siguiendo la prioridad pedida:
primero Dashboard, caja, gastos, presupuesto, alojamiento, ruta,
combustible, tareas, compras, mantenimiento e itinerario funcionando bien.
