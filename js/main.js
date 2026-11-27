const STORAGE_KEYS = {
  theme: "aurelia_theme_v1",
  cart: "aurelia_cart_v1",
  favorites: "aurelia_favorites_v1"
};

let cachedProducts = null;

/**
 * Formatea números como moneda formal en pesos mexicanos.
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

/**
 * Escapa caracteres especiales para evitar inyección HTML al insertar texto dinámico.
 */
export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Carga productos desde data/productos.json con caché en memoria.
 */
export async function getProducts() {
  if (Array.isArray(cachedProducts)) {
    return cachedProducts;
  }

  const response = await fetch("data/productos.json");
  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo (${response.status})`);
  }

  const data = await response.json();
  cachedProducts = Array.isArray(data) ? data : [];
  return cachedProducts;
}

/* ===========================
   TEMA CLARO / OSCURO
   =========================== */

export function getSavedTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  const normalized = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", normalized);
  localStorage.setItem(STORAGE_KEYS.theme, normalized);
  updateThemeButtons(normalized);
}

function updateThemeButtons(theme) {
  const isDark = theme === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(isDark));
    btn.setAttribute("title", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    btn.innerHTML = isDark
      ? `<span aria-hidden="true">☀</span><span class="btn-label">Claro</span>`
      : `<span aria-hidden="true">☾</span><span class="btn-label">Oscuro</span>`;
  });
}

export function initTheme() {
  applyTheme(getSavedTheme());

  document.addEventListener("click", (event) => {
    const toggleBtn = event.target.closest("[data-theme-toggle]");
    if (!toggleBtn) return;
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    showToast(next === "dark" ? "Modo oscuro activado" : "Modo claro activado");
  });
}

/* ===========================
   CARRITO Y FAVORITOS
   =========================== */

export function getCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  updateHeaderCounters();
}

export function addToCart(productId, quantity = 1) {
  const qtyToAdd = Math.max(1, Number(quantity) || 1);
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += qtyToAdd;
  } else {
    cart.push({ id: productId, quantity: qtyToAdd });
  }

  saveCart(cart);
  showToast("Producto añadido al carrito");
}

export function updateCartQuantity(productId, quantity) {
  const qty = Number(quantity);
  const cart = getCart();

  if (qty <= 0) {
    const filtered = cart.filter((item) => item.id !== productId);
    saveCart(filtered);
    return filtered;
  }

  const target = cart.find((item) => item.id === productId);
  if (target) {
    target.quantity = qty;
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  const filtered = getCart().filter((item) => item.id !== productId);
  saveCart(filtered);
  showToast("Producto eliminado del carrito");
  return filtered;
}

export function clearCart() {
  saveCart([]);
  showToast("Carrito vaciado");
}

export function getFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  updateHeaderCounters();
}

export function isFavorite(productId) {
  return getFavorites().includes(productId);
}

export function toggleFavorite(productId) {
  const favorites = getFavorites();
  const exists = favorites.includes(productId);
  const next = exists
    ? favorites.filter((id) => id !== productId)
    : [...favorites, productId];

  saveFavorites(next);
  showToast(exists ? "Eliminado de favoritos" : "Guardado en favoritos");
  return next;
}

export function updateHeaderCounters() {
  const cartCount = getCart().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const favCount = getFavorites().length;

  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(cartCount);
  });

  document.querySelectorAll("[data-fav-count]").forEach((el) => {
    el.textContent = String(favCount);
  });
}

/* ===========================
   NAVEGACIÓN Y NOTIFICACIONES
   =========================== */

export function initNavigation() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav-links]");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentFile) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    }
  });
}

function getToastContainer() {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message) {
  const container = getToastContainer();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(6px)";
    toast.style.transition = "all 0.2s ease";
    setTimeout(() => toast.remove(), 220);
  }, 2400);
}

/**
 * Crea una tarjeta HTML formal para cualquier producto.
 */
export function renderProductCard(product) {
  const favActive = isFavorite(product.id);
  const detailUrl = `producto.html?id=${encodeURIComponent(product.id)}`;

  return `
    <article class="product-card" data-product-id="${escapeHtml(product.id)}">
      <div class="product-media">
        <a href="${detailUrl}" aria-label="Ver detalles de ${escapeHtml(product.nombre)}">
          <img src="${escapeHtml(product.imagen)}" alt="${escapeHtml(product.nombre)}" loading="lazy" />
        </a>
        ${product.etiqueta ? `<span class="badge">${escapeHtml(product.etiqueta)}</span>` : ""}
        <button
          type="button"
          class="fav-btn ${favActive ? "is-active" : ""}"
          data-fav-toggle="${escapeHtml(product.id)}"
          aria-pressed="${String(favActive)}"
          aria-label="${favActive ? "Quitar de favoritos" : "Agregar a favoritos"} ${escapeHtml(product.nombre)}"
        >
          ${favActive ? "♥" : "♡"}
        </button>
      </div>

      <div class="product-body">
        <span class="product-category">${escapeHtml(product.categoria)}</span>
        <h3 class="product-title">
          <a href="${detailUrl}">${escapeHtml(product.nombre)}</a>
        </h3>
        <p class="product-desc">${escapeHtml(product.resumen)}</p>

        <div class="product-footer">
          <span class="product-price price-tabular">${formatPrice(product.precio)}</span>
          <div class="product-actions">
            <a href="${detailUrl}" class="btn btn-secondary btn-sm">Ver</a>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              data-add-cart="${escapeHtml(product.id)}"
            >
              Añadir
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Inicializa delegaciones de eventos globales para botones de carrito y favoritos.
 */
export function initGlobalActions(onStateChange) {
  document.addEventListener("click", (event) => {
    const addBtn = event.target.closest("[data-add-cart]");
    if (addBtn) {
      const id = addBtn.getAttribute("data-add-cart");
      addToCart(id, 1);
      if (typeof onStateChange === "function") onStateChange();
      return;
    }

    const favBtn = event.target.closest("[data-fav-toggle]");
    if (favBtn) {
      const id = favBtn.getAttribute("data-fav-toggle");
      toggleFavorite(id);
      const active = isFavorite(id);

      document.querySelectorAll(`[data-fav-toggle="${CSS.escape(id)}"]`).forEach((btn) => {
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
        btn.textContent = active ? "♥" : "♡";
      });

      if (typeof onStateChange === "function") onStateChange();
    }
  });
}

export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("sw.js")
        .then((reg) => console.log("SW registrado:", reg.scope))
        .catch((err) => console.error("Error al registrar SW:", err));
    });
  }
}

export function initBaseLayout(onStateChange) {
  initTheme();
  initNavigation();
  updateHeaderCounters();
  initGlobalActions(onStateChange);
  registerServiceWorker();
}