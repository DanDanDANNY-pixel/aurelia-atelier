import {
  getProducts,
  initBaseLayout,
  renderProductCard,
  escapeHtml
} from "./main.js";

const CATEGORY_DESCRIPTIONS = {
  Relojería: "Instrumentos de medición con cajas esbeltas, cristal resistente y presencia sobria.",
  Marroquinería: "Portafolios, tarjeteros y piezas en piel tratada con costuras de alta resistencia.",
  Escritorio: "Herramientas de escritura, iluminación y organización para espacios de trabajo.",
  Accesorios: "Soluciones de resguardo y transporte diseñadas para proteger tus piezas."
};

function renderCategories(products, container) {
  if (!container) return;
  const categories = [...new Set(products.map((p) => p.categoria))];

  container.innerHTML = categories
    .map((category) => {
      const count = products.filter((p) => p.categoria === category).length;
      const desc = CATEGORY_DESCRIPTIONS[category] || "Piezas seleccionadas de nuestra colección.";
      const href = `catalogo.html?categoria=${encodeURIComponent(category)}`;

      return `
        <a href="${href}" class="category-card">
          <span class="product-category">${count} ${count === 1 ? "pieza" : "piezas"}</span>
          <h3 class="product-title">${escapeHtml(category)}</h3>
          <p class="product-desc" style="-webkit-line-clamp: 3;">${escapeHtml(desc)}</p>
        </a>
      `;
    })
    .join("");
}

function renderFeatured(products, container) {
  if (!container) return;
  const featured = products.filter((p) => p.destacado).slice(0, 4);
  const items = featured.length > 0 ? featured : products.slice(0, 4);
  container.innerHTML = items.map(renderProductCard).join("");
}

async function initHome() {
  initBaseLayout();

  const categoriesContainer = document.querySelector("[data-categories-grid]");
  const featuredContainer = document.querySelector("[data-featured-products]");

  try {
    const products = await getProducts();
    renderCategories(products, categoriesContainer);
    renderFeatured(products, featuredContainer);
  } catch (error) {
    if (featuredContainer) {
      featuredContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>No fue posible cargar las piezas destacadas</h3>
          <p class="section-subtitle" style="margin-inline: auto;">${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  }
}

initHome();