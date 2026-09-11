requireAuth();

function rentalRowHtml(r) {
  const canCancel = r.status === "Pending";
  return `
    <tr>
      <td><a href="item-details.html?id=${r.item?._id || ""}" style="font-weight:600;">${r.item?.name || "Item removed"}</a></td>
      <td>${r.owner?.name || "—"}</td>
      <td class="mono" style="font-size:12.5px;">${formatDate(r.startDate)} → ${formatDate(r.endDate)}</td>
      <td class="mono">${formatRupee(r.totalPrice)}</td>
      <td><span class="${statusStampClass(r.status)}">${r.status}</span></td>
      <td>${canCancel ? `<button class="btn btn-sm btn-outline" data-cancel="${r._id}">Cancel</button>` : ""}</td>
    </tr>`;
}

async function loadMyRentals() {
  const body = document.getElementById("rentalsBody");
  try {
    const rentals = await apiFetch("/rentals/mine");
    if (!rentals.length) {
      body.innerHTML = `<tr><td colspan="6">
        <div class="empty-state">
          <h3>You haven't rented anything yet</h3>
          <p>Browse items and send your first rental request.</p>
          <a href="items.html" class="btn btn-mustard">Browse items</a>
        </div>
      </td></tr>`;
      return;
    }
    body.innerHTML = rentals.map(rentalRowHtml).join("");

    body.querySelectorAll("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Cancel this rental request?")) return;
        btn.disabled = true;
        try {
          await apiFetch(`/rentals/${btn.dataset.cancel}/status`, {
            method: "PUT",
            body: JSON.stringify({ status: "Cancelled" }),
          });
          toast("Request cancelled");
          loadMyRentals();
        } catch (err) {
          toast(err.message, "error");
          btn.disabled = false;
        }
      });
    });
  } catch (err) {
    body.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h3>Couldn't load rentals</h3><p>${err.message}</p></div></td></tr>`;
  }
}

loadMyRentals();
