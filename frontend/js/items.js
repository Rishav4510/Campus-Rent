let currentPage = 1;

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("category")) document.getElementById("category").value = params.get("category");
  if (params.get("search")) document.getElementById("search").value = params.get("search");
}

function buildQuery(page = 1) {
  const search = document.getElementById("search").value.trim();
  const category = document.getElementById("category").value;
  const maxPrice = document.getElementById("maxPrice").value;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category && category !== "All") params.set("category", category);
  if (maxPrice) params.set("maxPrice", maxPrice);
  params.set("page", page);
  params.set("limit", 9);
  return params.toString();
}

async function loadItems(page = 1) {
  currentPage = page;
  const grid = document.getElementById("itemGrid");
  grid.innerHTML = `<div class="loader">Loading items…</div>`;
  try {
    const query = buildQuery(page);
    const data = await apiFetch(`/items?${query}`);
    document.getElementById("resultsCount").textContent = `${data.total} item${data.total === 1 ? "" : "s"}`;

    if (!data.items.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <h3>No items match those filters</h3>
        <p>Try a broader search or a different category.</p>
      </div>`;
      document.getElementById("pagination").innerHTML = "";
      return;
    }

    grid.innerHTML = data.items.map(itemCardHtml).join("");
    renderPagination(data.page, data.pages);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>Couldn't load items</h3><p>${err.message}</p></div>`;
  }
}

function renderPagination(page, pages) {
  const el = document.getElementById("pagination");
  if (pages <= 1) { el.innerHTML = ""; return; }
  let html = "";
  for (let i = 1; i <= pages; i++) {
    html += `<button class="btn btn-sm ${i === page ? "btn-mustard" : "btn-outline"}" data-page="${i}">${i}</button>`;
  }
  el.innerHTML = html;
  el.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => loadItems(Number(btn.dataset.page)));
  });
}

document.getElementById("filterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  loadItems(1);
});

readFiltersFromUrl();
loadItems(1);
