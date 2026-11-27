import {
  getProducts,
  initBaseLayout,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getFavorites,
  renderProductCard,
  formatPrice,
  escapeHtml,
  showToast
} from "./main.js";

let productsById = new Map();

const els = {
  itemsContainer: document.querySelector("[data-cart-items]"),
  subtotal: document.querySelector("[data-cart-subtotal]"),
  tax: document.querySelector("[data-cart-tax]"),
  total: document.querySelector("[data-cart-total]"),
  clearBtn: document.querySelector("[data-clear-cart]"),
  checkoutBtn: document.querySelector("[data-checkout-btn]"),
  checkoutMsg: document.querySelector("[data-checkout-message]"),
  favoritesGrid: document.querySelector("[data-favorites-grid]")
};

function renderCartView() {
  const cart = getCart();
  const detailedItems = cart
    .map((entry) => {
      const product = productsById.get(entry.id);
      if (!product) return null;
      return {
        ...product,
        quantity: Number(entry.quantity) || 1,
        lineTotal: (Number(product.precio) || 0) * (Number(entry.quantity) || 1)
      };
    })
    .filter(Boolean);

  if (els.itemsContainer) {
    if (detailedItems.length === 0) {
      els.itemsContainer.innerHTML = `
        <div class="empty-state">
          <h3>Tu carrito está vacío</h3>
          <p class="section-subtitle" style="margin: 8px auto 18px;">
            Explora el catálogo o agrega alguna de tus piezas favoritas.
          </p>
          <a href="catalogo.html" class="btn btn-primary btn-sm">Ir al catálogo</a>
        </div>
      `;
    } else {
      els.itemsContainer.innerHTML = detailedItems
        .map(
          (item) => `
        <article class="cart-item" data-cart-row="${escapeHtml(item.id)}">
          <a href="producto.html?id=${encodeURIComponent(item.id)}">
            <img src="${escapeHtml(item.imagen)}" alt="${escapeHtml(item.nombre)}" />
          </a>

          <div>
            <span class="product-category">${escapeHtml(item.categoria)}</span>
            <h3 class="product-title" style="font-size: 1.04rem; margin-top: 2px;">
              <a href="producto.html?id=${encodeURIComponent(item.id)}">${escapeHtml(item.nombre)}</a>
            </h3>
            <p class="product-desc" style="margin-top: 4px;">
              Unitario: <span class="price-tabular">${formatPrice(item.precio)}</span> · Subtotal:
              <strong class="price-tabular">${formatPrice(item.lineTotal)}</strong>
            </p>
          </div>

          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <div class="qty-control" aria-label="Cantidad de ${escapeHtml(item.nombre)}">
              <button type="button" data-qty-dec="${escapeHtml(item.id)}" aria-label="Disminuir cantidad">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-qty-inc="${escapeHtml(item.id)}" aria-label="Aumentar cantidad">+</button>
            </div>
            <button type="button" class="btn btn-ghost btn-sm" style="color: var(--danger);" data-remove-item="${escapeHtml(item.id)}">
              Eliminar
            </button>
          </div>
        </article>
      `
        )
        .join("");
    }
  }

  const subtotalAmount = detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = Math.round(subtotalAmount * 0.16);
  const totalAmount = subtotalAmount + taxAmount;

  if (els.subtotal) els.subtotal.textContent = formatPrice(subtotalAmount);
  if (els.tax) els.tax.textContent = formatPrice(taxAmount);
  if (els.total) els.total.textContent = formatPrice(totalAmount);
  if (els.checkoutBtn) els.checkoutBtn.disabled = detailedItems.length === 0;
}

function renderFavoritesView() {
  if (!els.favoritesGrid) return;
  const favIds = getFavorites();
  const favProducts = favIds.map((id) => productsById.get(id)).filter(Boolean);

  if (favProducts.length === 0) {
    els.favoritesGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Aún no tienes favoritos guardados</h3>
        <p class="section-subtitle" style="margin: 8px auto 0;">
          Usa el ícono de corazón (♡) en cualquier tarjeta del catálogo o ficha de producto.
        </p>
      </div>
    `;
    return;
  }

  els.favoritesGrid.innerHTML = favProducts.map(renderProductCard).join("");
}

function refreshAllViews() {
  renderCartView();
  renderFavoritesView();
}

async function initCartPage() {
  initBaseLayout(refreshAllViews);

  try {
    const products = await getProducts();
    productsById = new Map(products.map((p) => [p.id, p]));
    refreshAllViews();

    els.itemsContainer?.addEventListener("click", (event) => {
      const decBtn = event.target.closest("[data-qty-dec]");
      if (decBtn) {
        const id = decBtn.getAttribute("data-qty-dec");
        const current = getCart().find((i) => i.id === id)?.quantity || 1;
        updateCartQuantity(id, current - 1);
        refreshAllViews();
        return;
      }

      const incBtn = event.target.closest("[data-qty-inc]");
      if (incBtn) {
        const id = incBtn.getAttribute("data-qty-inc");
        const current = getCart().find((i) => i.id === id)?.quantity || 0;
        updateCartQuantity(id, current + 1);
        refreshAllViews();
        return;
      }

      const rmBtn = event.target.closest("[data-remove-item]");
      if (rmBtn) {
        const id = rmBtn.getAttribute("data-remove-item");
        removeFromCart(id);
        refreshAllViews();
      }
    });

    els.clearBtn?.addEventListener("click", () => {
      clearCart();
      if (els.checkoutMsg) els.checkoutMsg.innerHTML = "";
      refreshAllViews();
    });

    els.checkoutBtn?.addEventListener("click", () => {
      if (getCart().length === 0) return;
      clearCart();
      refreshAllViews();
      if (els.checkoutMsg) {
        els.checkoutMsg.innerHTML = `
          <div class="alert-success">
            Pedido de prueba registrado correctamente. Gracias por explorar Aurelia Atelier.
          </div>
        `;
      }
      showToast("Pedido de prueba confirmado");
    });
  } catch (error) {
    if (els.itemsContainer) {
      els.itemsContainer.innerHTML = `
        <div class="empty-state">
          <h3>Error al cargar el carrito</h3>
          <p class="section-subtitle">${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  }
}

initCartPage();