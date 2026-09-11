requireAuth();

const user = getUser();
if (!user || user.role !== "admin") {
  document.body.innerHTML = `<div class="container" style="padding-top:80px;">
    <div class="empty-state"><h3>Admins only</h3><p>You don't have access to this page.</p>
    <a href="index.html" class="btn btn-mustard">Back home</a></div></div>`;
}

document.querySelectorAll(".dash-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".dash-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    ["users", "items", "rentals"].forEach((name) => {
      document.getElementById(`tab-${name}`).style.display = name === tab.dataset.tab ? "block" : "none";
    });
  });
});

async function loadStats() {
  try {
    const stats = await apiFetch("/admin/stats");
    document.getElementById("statUsers").textContent = stats.userCount;
    document.getElementById("statItems").textContent = stats.itemCount;
    document.getElementById("statRentals").textContent = stats.rentalCount;
  } catch (err) {
    toast(err.message, "error");
  }
}

async function loadUsers() {
  const body = document.getElementById("usersBody");
  try {
    const users = await apiFetch("/admin/users");
    body.innerHTML = users
      .map(
        (u) => `<tr>
          <td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.hostel || "—"}</td>
          <td class="mono" style="font-size:12px;">${formatDate(u.createdAt)}</td>
          <td>${u.role !== "admin" ? `<button class="btn btn-sm btn-danger" data-del-user="${u._id}">Remove</button>` : ""}</td>
        </tr>`
      )
      .join("");
    body.querySelectorAll("[data-del-user]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm("Remove this user?")) return;
        try {
          await apiFetch(`/admin/users/${btn.dataset.delUser}`, { method: "DELETE" });
          toast("User removed");
          loadUsers();
          loadStats();
        } catch (err) {
          toast(err.message, "error");
        }
      })
    );
  } catch (err) {
    body.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
  }
}

async function loadItems() {
  const body = document.getElementById("itemsBody");
  try {
    const items = await apiFetch("/admin/items");
    body.innerHTML = items
      .map(
        (i) => `<tr>
          <td>${i.name}</td><td>${i.category}</td><td>${i.owner?.name || "—"}</td>
          <td class="mono">${formatRupee(i.pricePerDay)}</td>
          <td><span class="${i.available ? "stamp stamp-available" : "stamp stamp-unavailable"}">${i.available ? "Available" : "Rented"}</span></td>
          <td><button class="btn btn-sm btn-danger" data-del-item="${i._id}">Remove</button></td>
        </tr>`
      )
      .join("");
    body.querySelectorAll("[data-del-item]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm("Remove this item?")) return;
        try {
          await apiFetch(`/admin/items/${btn.dataset.delItem}`, { method: "DELETE" });
          toast("Item removed");
          loadItems();
          loadStats();
        } catch (err) {
          toast(err.message, "error");
        }
      })
    );
  } catch (err) {
    body.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
  }
}

async function loadRentals() {
  const body = document.getElementById("rentalsBody");
  try {
    const rentals = await apiFetch("/admin/rentals");
    body.innerHTML = rentals
      .map(
        (r) => `<tr>
          <td>${r.item?.name || "—"}</td><td>${r.renter?.name || "—"}</td><td>${r.owner?.name || "—"}</td>
          <td class="mono" style="font-size:12px;">${formatDate(r.startDate)} → ${formatDate(r.endDate)}</td>
          <td class="mono">${formatRupee(r.totalPrice)}</td>
          <td><span class="${statusStampClass(r.status)}">${r.status}</span></td>
        </tr>`
      )
      .join("");
  } catch (err) {
    body.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
  }
}

if (user && user.role === "admin") {
  loadStats();
  loadUsers();
  loadItems();
  loadRentals();
}
