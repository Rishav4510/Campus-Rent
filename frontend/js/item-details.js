const itemId = new URLSearchParams(window.location.search).get("id");
const content = document.getElementById("content");

async function loadItem() {
  if (!itemId) {
    content.innerHTML = `<div class="empty-state"><h3>No item specified</h3><a class="btn btn-mustard" href="items.html">Back to browse</a></div>`;
    return;
  }
  try {
    const item = await apiFetch(`/items/${itemId}`);
    renderItem(item);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><h3>Item not found</h3><p>${err.message}</p><a class="btn btn-mustard" href="items.html">Back to browse</a></div>`;
  }
}

function renderItem(item) {
  const user = getUser();
  const isOwner = user && item.owner && user._id === item.owner._id;
  const stampClass = item.available ? "stamp-available" : "stamp-unavailable";
  const stampText = item.available ? "Available" : "Currently rented out";

  content.innerHTML = `
    <div class="eyebrow"><a href="items.html">← Back to browse</a></div>
    <div class="detail-grid">
      <div>
        <div class="detail-img">
          ${item.image ? `<img src="${imageUrl(item.image)}" alt="${item.name}" />` : "no photo uploaded"}
        </div>
      </div>
      <div>
        <div class="item-card-cat">${item.category}</div>
        <h1>${item.name}</h1>
        <span class="stamp ${stampClass}">${stampText}</span>
        <p style="margin-top:16px;">${item.description}</p>

        <div class="price-tag">${formatRupee(item.pricePerDay)} <small>/ day</small></div>

        <div class="owner-strip">
          <div class="owner-avatar">${initials(item.owner?.name)}</div>
          <div>
            <div style="font-weight:600;">${item.owner?.name || "Unknown"}</div>
            <div class="mono" style="font-size:12px; color:#5B6472;">${item.owner?.hostel || "Campus"} · condition: ${item.condition}</div>
          </div>
        </div>

        <div id="rentArea"></div>
      </div>
    </div>
  `;

  const rentArea = document.getElementById("rentArea");

  if (!user) {
    rentArea.innerHTML = `<div class="alert" style="background:#F8F7F2; border-color:#D6D3C7; color:#5B6472;">
      <a href="login.html" style="color:#C1443B; font-weight:600;">Log in</a> to send a rental request for this item.
    </div>`;
    return;
  }

  if (isOwner) {
    rentArea.innerHTML = `<div class="alert" style="background:#F8F7F2; border-color:#D6D3C7; color:#5B6472;">
      This is your own listing. Manage it from <a href="my-items.html" style="color:#C1443B; font-weight:600;">My Items</a>.
    </div>`;
    return;
  }

  if (!item.available) {
    rentArea.innerHTML = `<div class="alert alert-error">This item is currently rented out by someone else. Check back later.</div>`;
    return;
  }

  rentArea.innerHTML = `
    <div class="panel" style="padding:20px; margin-top:20px;">
      <h3 style="font-size:17px;">Request to rent</h3>
      <div id="rentAlert"></div>
      <form id="rentForm">
        <div class="grid-2">
          <div class="form-row">
            <label for="startDate">Start date</label>
            <input type="date" id="startDate" required />
          </div>
          <div class="form-row">
            <label for="endDate">End date</label>
            <input type="date" id="endDate" required />
          </div>
        </div>
        <div class="form-row">
          <label for="note">Note to owner <span style="text-transform:none; font-weight:400;">(optional)</span></label>
          <textarea id="note" placeholder="e.g. Need it for my Tuesday practical exam"></textarea>
        </div>
        <div class="mono" id="totalPreview" style="font-size:14px; margin-bottom:14px; color:#5B6472;"></div>
        <button type="submit" class="btn btn-mustard btn-block">Send rental request</button>
      </form>
    </div>
  `;

  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");
  const today = new Date().toISOString().split("T")[0];
  startInput.min = today;
  endInput.min = today;

  const updatePreview = () => {
    const preview = document.getElementById("totalPreview");
    const s = new Date(startInput.value);
    const e = new Date(endInput.value);
    if (startInput.value && endInput.value && e > s) {
      const days = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
      preview.textContent = `${days} day${days > 1 ? "s" : ""} × ${formatRupee(item.pricePerDay)} = ${formatRupee(days * item.pricePerDay)}`;
    } else {
      preview.textContent = "";
    }
  };
  startInput.addEventListener("change", updatePreview);
  endInput.addEventListener("change", updatePreview);

  document.getElementById("rentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const rentAlert = document.getElementById("rentAlert");
    rentAlert.innerHTML = "";
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Sending request…";
    try {
      await apiFetch("/rentals", {
        method: "POST",
        body: JSON.stringify({
          itemId: item._id,
          startDate: startInput.value,
          endDate: endInput.value,
          note: document.getElementById("note").value,
        }),
      });
      toast("Rental request sent to the owner");
      setTimeout(() => (window.location.href = "my-rentals.html"), 500);
    } catch (err) {
      rentAlert.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
      btn.disabled = false;
      btn.textContent = "Send rental request";
    }
  });
}

loadItem();
