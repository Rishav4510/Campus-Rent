/* Shared helpers: auth storage, fetch wrapper, navbar, toast, formatting */

// ---------- Auth storage ----------
function getToken() { return localStorage.getItem("cr_token"); }
function getUser() {
  const raw = localStorage.getItem("cr_user");
  return raw ? JSON.parse(raw) : null;
}
function setSession(user, token) {
  localStorage.setItem("cr_token", token);
  localStorage.setItem("cr_user", JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem("cr_token");
  localStorage.removeItem("cr_user");
}
function isLoggedIn() { return !!getToken(); }
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

// ---------- Fetch wrapper ----------
async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

// ---------- Toast ----------
function toast(message, type = "success") {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = type === "error" ? "error" : "";
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 3200);
}

// ---------- Formatting ----------
function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatRupee(n) { return `₹${Number(n).toLocaleString("en-IN")}`; }
function imageUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${UPLOADS_BASE}${path}`;
}
function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
function statusStampClass(status) {
  return `stamp stamp-${(status || "").toLowerCase()}`;
}

// ---------- Shared item card markup ----------
function itemCardHtml(item) {
  const img = item.image ? `style="background-image:url('${imageUrl(item.image)}')"` : "";
  const imgLabel = item.image ? "" : "no photo";
  const stampClass = item.available ? "stamp-available" : "stamp-unavailable";
  const stampText = item.available ? "Available" : "Rented out";
  return `
    <a class="item-card" href="item-details.html?id=${item._id}">
      <div class="item-card-img" ${img}>${imgLabel}</div>
      <div class="item-card-body">
        <div class="item-card-cat">${item.category}</div>
        <div class="item-card-title">${item.name}</div>
        <p class="item-card-desc">${item.description}</p>
        <div class="ledger-line"><span>${item.owner?.name || "Owner"}</span><span class="dots"></span><span class="price">${formatRupee(item.pricePerDay)}/day</span></div>
        <div class="item-card-footer">
          <span class="stamp ${stampClass}">${stampText}</span>
        </div>
      </div>
    </a>`;
}

// ---------- Navbar ----------
function renderNavbar(active) {
  const mount = document.getElementById("navbar");
  if (!mount) return;
  const user = getUser();

  const links = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "items.html", label: "Browse Items", key: "items" },
  ];
  if (user) {
    links.push({ href: "add-item.html", label: "List an Item", key: "add-item" });
    links.push({ href: "my-items.html", label: "My Items", key: "my-items" });
    links.push({ href: "my-rentals.html", label: "My Rentals", key: "my-rentals" });
    if (user.role === "admin") links.push({ href: "admin.html", label: "Admin", key: "admin" });
  }

  const linksHtml = links
    .map((l) => `<a href="${l.href}" class="${active === l.key ? "active" : ""}">${l.label}</a>`)
    .join("");

  const rightHtml = user
    ? `<div class="nav-user">
         <span>${user.name} (${user.role})</span>
         <a href="profile.html" class="btn btn-sm btn-outline" style="border-color: rgba(236,238,233,.4); color:#ECEEE9;">Profile</a>
         <button class="btn btn-sm btn-mustard" id="logoutBtn">Logout</button>
       </div>`
    : `<div class="nav-user">
         <a href="login.html" class="btn btn-sm btn-outline" style="border-color: rgba(236,238,233,.4); color:#ECEEE9;">Log in</a>
         <a href="register.html" class="btn btn-sm btn-mustard">Sign up</a>
       </div>`;

  mount.innerHTML = `
    <div class="navbar-inner">
      <a href="index.html" class="brand"><span class="brand-badge">CR</span> CampusRent</a>
      <nav class="nav-links">${linksHtml}</nav>
      ${rightHtml}
    </div>
  `;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      toast("Logged out");
      setTimeout(() => (window.location.href = "index.html"), 300);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const active = document.body.getAttribute("data-page");
  renderNavbar(active);
});
