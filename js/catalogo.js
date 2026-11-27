import {
  getProducts,
  initBaseLayout,
  renderProductCard,
  formatPrice,
  escapeHtml
} from "./main.js";

let allProducts = [];

const els = {
  grid: document.querySelector("[data-catalog-grid]"),
  search: document.querySelector("[data-filter-search]"),
  category: document.querySelector("[data-filter-category]"),
  price: document.querySelector("[data-filter-price]"),
  sort: document.querySelector("[data-filter-sort]"),
  resetBtn: document.querySelector("[data-reset-filters]"),
  countLabel: document.querySelector("[data-results-count]"),
  activeFiltersLabel: document.querySelector("[data-active-filters]")
};

function populateCategories(products) {
  if (!els.category) return;
  const categories = [...new Set(products.map((p) => p.categoria))];
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    els.category.appendChild(option);
  });

  const params = new URLSearchParams(window.location.search);
  const urlCat = params.get("categoria");
  if (urlCat && categories.includes(urlCat)) {
    els.category.value = urlCat;
  }
}

function getFilteredAndSortedProducts() {
  const query = (els.search?.value || "").trim().toLowerCase();
  const selectedCategory = els.category?.value || "all";
  const maxPrice = els.price?.value === "all" ? Infinity : Number(els.price?.value || Infinity);
  const sortMode = els.sort?.value || "featured";

  let filtered = allProducts.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.categoria === selectedCategory;
    const matchesPrice = Number(product.precio) <= maxPrice;
    const haystack = [
      product.nombre,
      product.categoria,
      product.resumen,
      product.etiqueta,
      ...Object.values(product.especificaciones || {})
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || haystack.includes(query);
    return matchesCategory && matchesPrice && matchesQuery;
  });

  if (sortMode === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.precio - b.precio);
  } else if (sortMode === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.precio - a.precio);
  } else if (sortMode === "name-asc") {
    filtered = [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  } else {
    filtered = [...filtered].sort((a, b) => Number(b.destacado) - Number(a.destacado));
  }

  return { filtered, query, selectedCategory, maxPrice };
}

function updateCatalogView() {
  const { filtered, query, selectedCategory, maxPrice } = getFilteredAndSortedProducts();

  if (els.countLabel) {
    els.countLabel.textContent = `Mostrando ${filtered.length} de ${allProducts.length} piezas`;
  }

  const tags = [];
  if (selectedCategory !== "all") tags.push(`Categoría: ${selectedCategory}`);
  if (Number.isFinite(maxPrice)) tags.push(`Hasta ${formatPrice(maxPrice)}`);
  if (query) tags.push(`Búsqueda: "${query}"`);

  if (els.activeFiltersLabel) {
    els.activeFiltersLabel.textContent = tags.length ? `Filtros activos · ${tags.join(" · ")}` : "";
  }

  if (!els.grid) return;

  if (filtered.length === 0) {
    els.grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>No se encontraron piezas con esos criterios</h3>
        <p class="section-subtitle" style="margin: 8px auto 18px;">
          Intenta limpiar los filtros o buscar con otra palabra clave.
        </p>
        <button type="button" class="btn btn-primary btn-sm" data-empty-reset>
          Restablecer filtros
        </button>
      </div>
    `;
    return;
  }

  els.grid.innerHTML = filtered.map(renderProductCard).join("");
}

function resetFilters() {
  if (els.search) els.search.value = "";
  if (els.category) els.category.value = "all";
  if (els.price) els.price.value = "all";
  if (els.sort) els.sort.value = "featured";
  updateCatalogView();
}

async function initCatalog() {
  initBaseLayout();

  try {
    allProducts = await getProducts();
    populateCategories(allProducts);
    updateCatalogView();

    [els.search, els.category, els.price, els.sort].forEach((input) => {
      input?.addEventListener("input", updateCatalogView);
      input?.addEventListener("change", updateCatalogView);
    });

    els.resetBtn?.addEventListener("click", resetFilters);

    els.grid?.addEventListener("click", (event) => {
      if (event.target.closest("[data-empty-reset]")) {
        resetFilters();
      }
    });
  } catch (error) {
    if (els.grid) {
      els.grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>Error al cargar el catálogo</h3>
          <p class="section-subtitle" style="margin-inline: auto;">${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  }
}

initCatalog();