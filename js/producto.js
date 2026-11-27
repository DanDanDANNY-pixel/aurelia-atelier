import {
  getProducts,
  initBaseLayout,
  renderProductCard,
  addToCart,
  toggleFavorite,
  isFavorite,
  formatPrice,
  escapeHtml,
  showToast
} from "./main.js";

function renderProductDetail(product, container) {
  const fav = isFavorite(product.id);
  const specsEntries = Object.entries(product.especificaciones || {});
  const maxQty = Math.max(1, Number(product.stock) || 10);

  document.title = `${product.nombre} — Aurelia Atelier`;
  const crumb = document.querySelector("[data-breadcrumb-name]");
  if (crumb) crumb.textContent = product.nombre;

  container.innerHTML = `
    <div class="detail-grid">
      <div class="detail-image-box">
        <img src="${escapeHtml(product.imagen)}" alt="${escapeHtml(product.nombre)}" />
      </div>

      <div>
        <span class="section-eyebrow">${escapeHtml(product.categoria)} · ${escapeHtml(product.etiqueta || "Colección")}</span>
        <h1 class="section-title">${escapeHtml(product.nombre)}</h1>
        <p class="section-subtitle" style="margin-top: 10px;">${escapeHtml(product.resumen)}</p>

        <div class="detail-price price-tabular">${formatPrice(product.precio)}</div>

        <p style="color: var(--text-secondary); margin-bottom: 14px;">
          ${escapeHtml(product.descripcion)}
        </p>

        <p style="font-size: 0.88rem; color: var(--success); font-weight: 600; margin-bottom: 20px;">
          ● Disponible (${escapeHtml(String(product.stock))} unidades en existencia)
        </p>

        <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
          <label for="detail-qty" class="sr-only">Cantidad</label>
          <input
            type="number"
            id="detail-qty"
            class="input"
            value="1"
            min="1"
            max="${maxQty}"
            style="width: 84px; text-align: center;"
            data-detail-qty
          />

          <button type="button" class="btn btn-primary" data-detail-add="${escapeHtml(product.id)}">
            Añadir al carrito
          </button>

          <button
            type="button"
            class="btn btn-secondary"
            data-detail-fav="${escapeHtml(product.id)}"
            aria-pressed="${String(fav)}"
          >
            ${fav ? "♥ En favoritos" : "♡ Guardar en favoritos"}
          </button>
        </div>

        ${
          specsEntries.length
            ? `
          <div class="specs-list" aria-label="Especificaciones técnicas">
            <h2 class="product-title" style="margin-top: 20px; margin-bottom: 6px;">Especificaciones</h2>
            ${specsEntries
              .map(
                ([key, val]) => `
              <div class="specs-row">
                <span class="specs-key">${escapeHtml(key)}</span>
                <span>${escapeHtml(String(val))}</span>
              </div>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;

  const addBtn = container.querySelector("[data-detail-add]");
  const qtyInput = container.querySelector("[data-detail-qty]");
  const favBtn = container.querySelector("[data-detail-fav]");

  addBtn?.addEventListener("click", () => {
    const qty = Math.min(maxQty, Math.max(1, Number(qtyInput?.value) || 1));
    addToCart(product.id, qty);
  });

  favBtn?.addEventListener("click", () => {
    toggleFavorite(product.id);
    const active = isFavorite(product.id);
    favBtn.setAttribute("aria-pressed", String(active));
    favBtn.textContent = active ? "♥ En favoritos" : "♡ Guardar en favoritos";
  });
}

function renderNotFoundState(container, message) {
  container.innerHTML = `
    <div class="empty-state">
      <h2>Pieza no encontrada</h2>
      <p class="section-subtitle" style="margin: 10px auto 20px;">${escapeHtml(message)}</p>
      <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
        <a href="catalogo.html" class="btn btn-primary btn-sm">Ir al catálogo</a>
        <a href="404.html" class="btn btn-secondary btn-sm">Ver página 404</a>
      </div>
    </div>
  `;
}

async function initProductPage() {
  initBaseLayout();

  const detailContainer = document.querySelector("[data-product-detail]");
  const relatedContainer = document.querySelector("[data-related-products]");

  try {
    const products = await getProducts();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const product = products.find((item) => item.id === id) || products[0];

    if (!id) {
      showToast("Mostrando pieza principal de ejemplo");
    }

    if (!product) {
      if (detailContainer) renderNotFoundState(detailContainer, "No hay productos disponibles.");
      return;
    }

    if (detailContainer) {
      renderProductDetail(product, detailContainer);
    }

    if (relatedContainer) {
      const related = products
        .filter((item) => item.id !== product.id)
        .sort((a, b) => Number(b.categoria === product.categoria) - Number(a.categoria === product.categoria))
        .slice(0, 4);

      relatedContainer.innerHTML = related.map(renderProductCard).join("");
    }
  } catch (error) {
    if (detailContainer) {
      renderNotFoundState(detailContainer, error.message);
    }
  }
}

initProductPage();