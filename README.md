# Aurelia Atelier — Sitio de Catálogo de Productos

Sitio web multipágina de catálogo ejecutivo con estética formal, diseño responsivo, modo claro/oscuro persistente, filtros dinámicos, favoritos, carrito con desglose de totales y formulario de contacto validado en cliente.

## Características principales

- **Arquitectura multipágina:** `index.html`, `catalogo.html`, `producto.html`, `carrito.html`, `contacto.html` y `404.html`.
- **Estilos en capas (`css/`):**
  - `variables.css`: tokens de color para modo claro y oscuro, tipografías, bordes y sombras.
  - `base.css`: reglas base, accesibilidad de enfoque y contenedores.
  - `components.css`: barra superior, tarjetas de producto, botones, badges, notificaciones tipo toast y footer.
  - `pages.css`: maquetación específica de inicio, catálogo, ficha de producto, carrito/favoritos, contacto y 404.
- **Datos dinámicos (`data/productos.json` + `img/p1.svg`–`p8.svg`):** 8 piezas estructuradas con categoría, precio, stock, especificaciones técnicas y ilustraciones vectoriales.
- **Lógica modular en JavaScript (`js/`):**
  - `main.js`: carga con caché del JSON, manejo de tema en `localStorage`, carrito, favoritos, contadores y notificaciones.
  - `inicio.js`: categorías dinámicas y selección de piezas destacadas.
  - `catalogo.js`: búsqueda por texto, filtro por categoría, filtro por precio máximo, ordenamiento y limpieza de filtros.
  - `producto.js`: consulta por parámetro `?id=...`, selector de cantidad, favoritos y productos relacionados.
  - `carrito.js`: ajuste de cantidades, eliminación, vaciado, cálculo de subtotal/IVA/total, simulación de pedido y sección de favoritos guardados.
  - `contacto.js`: validación en tiempo real y al enviar con mensajes de error claros y confirmación visual.

## Ejecución local

Abre la carpeta del proyecto en **Visual Studio Code** e inicia el servidor local con la extensión **Live Server** (`Open with Live Server` desde `index.html`).