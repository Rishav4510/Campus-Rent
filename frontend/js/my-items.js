requireAuth();

// ---------- Tabs ----------
document.querySelectorAll(".dash-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".dash-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("tab-items").style.display = tab.dataset.tab === "items" ? "block" : "none";
    document.getElementById("tab-requests").style.display = tab.dataset.tab === "requests" ? "block" : "none";
  });
});

// ---------- My items ----------
function ownerItemCardHtml(item) {
  const img = item.image ? `style="background-image:url('${imageUrl(item.image)}')"` : "";
  const imgLabel = item.image ? "" : "no photo";
  const stampClass = item.available ? "stamp-available" : "stamp-unavailable";
  const stampText = item.available ? "Available" : "Rented out";
  return `
    <div class="item-card">
      <a href="item-details.html?id=${item._id}">
        <div class="item-card-img" ${img}>${imgLabel}</div>
      </a>
      <div class="item-card-body">
        <div class="item-card-cat">${item.category}</div>
        <div class="item-card-title">${item.name}</div>
        <div class="ledger-line"><span>per day</span><span class="dots"></span><span class="price">${formatRupee(item.pricePerDay)}</span></div>
        <div class="item-card-footer" style="margin-bottom:10px;">
          <span class="stamp ${stampClass}">${stampText}</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-outline btn-sm" data-toggle="${item._id}" data-available="${item.available}">
            ${item.available ? "Mark unavailable" : "Mark available"}
          </button>
          <button class="btn btn-danger btn-sm" data-delete="${item._id}">Delete</button>
        </div>
      </div>
    </div>`;
}

async function loadMyItems() {
  const grid = document.getElementById("myItemsGrid");
  try {
    const items = await apiFetch("/items/mine/list");
    if (!items.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <h3>You haven't listed anything yet</h3>
        <p>List your calculator, lab coat, or cycle and start earning between exams.</p>
        <a href="add-item.html" class="btn btn-mustard">List an item</a>
      </div>`;
      return;
    }
    grid.innerHTML = items.map(ownerItemCardHtml).join("");

    grid.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.toggle;
        const currentlyAvailable = btn.dataset.available === "true";
        btn.disabled = true;
        try {
          await apiFetch(`/items/${id}`, {
            method: "PUT",
            body: JSON.stringify({ available: !currentlyAvailable }),
          });
          toast("Item updated");
          loadMyItems();
        } catch (err) {
          toast(err.message, "error");
          btn.disabled = false;
        }
      });
    });

    grid.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this item? This cannot be undone.")) return;
        const id = btn.dataset.delete;
        btn.disabled = true;
        try {
          await apiFetch(`/items/${id}`, { method: "DELETE" });
          toast("Item deleted");
          loadMyItems();
        } catch (err) {
          toast(err.message, "error");
          btn.disabled = false;
        }
      });
    });
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>Couldn't load your items</h3><p>${err.message}</p></div>`;
  }
}

// ---------- Rental requests received ----------
function requestRowHtml(r) {
  const thumb = r.item?.image ? `style="background-image:url('${imageUrl(r.item.image)}')"` : "";
  const actions =
    r.status === "Pending"
      ? `<button class="btn btn-sm btn-mustard" data-accept="${r._id}">Accept</button>
         <button class="btn btn-sm btn-danger" data-reject="${r._id}">Reject</button>`
      : r.status === "Accepted"
      ? `<button class="btn btn-sm btn-outline" data-complete="${r._id}">Mark completed</button>`
      : "";
  return `
    <div class="request-row">
      <div class="request-info">
        <div class="request-thumb" ${thumb}></div>
        <div>
          <div style="font-weight:600;">${r.renter?.name || "Student"} wants to rent <em>${r.item?.name || "an item"}</em></div>
          <div class="mono" style="font-size:12px; color:#5B6472;">${formatDate(r.startDate)} → ${formatDate(r.endDate)} · ${formatRupee(r.totalPrice)}</div>
          ${r.note ? `<div style="font-size:13px; margin-top:4px;">"${escapeHtml(r.note)}"</div>` : ""}
        </div>
      </div>
      <div class="request-actions">
        <span class="${statusStampClass(r.status)}">${r.status}</span>
        ${actions}
      </div>
    </div>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadRequests() {
  const panel = document.getElementById("requestsPanel");
  try {
    const requests = await apiFetch("/rentals/requests");
    const pending = requests.filter((r) => r.status === "Pending").length;
    document.getElementById("pendingBadge").textContent = pending ? `(${pending})` : "";

    if (!requests.length) {
      panel.innerHTML = `<div class="empty-state"><h3>No rental requests yet</h3><p>Once someone requests one of your items, it'll show up here.</p></div>`;
      return;
    }

    panel.innerHTML = requests.map(requestRowHtml).join("");

    panel.querySelectorAll("[data-accept]").forEach((btn) =>
      btn.addEventListener("click", () => setStatus(btn.dataset.accept, "Accepted"))
    );
    panel.querySelectorAll("[data-reject]").forEach((btn) =>
      btn.addEventListener("click", () => setStatus(btn.dataset.reject, "Rejected"))
    );
    panel.querySelectorAll("[data-complete]").forEach((btn) =>
      btn.addEventListener("click", () => setStatus(btn.dataset.complete, "Completed"))
    );
  } catch (err) {
    panel.innerHTML = `<div class="empty-state"><h3>Couldn't load requests</h3><p>${err.message}</p></div>`;
  }
}

async function setStatus(id, status) {
  try {
    await apiFetch(`/rentals/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    toast(`Request marked ${status.toLowerCase()}`);
    loadRequests();
    loadMyItems();
  } catch (err) {
    toast(err.message, "error");
  }
}

loadMyItems();
loadRequests();
