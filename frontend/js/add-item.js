requireAuth();

const imageInput = document.getElementById("image");
const previewWrap = document.getElementById("previewWrap");
const previewImg = document.getElementById("previewImg");
const dropLabel = document.getElementById("dropLabel");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  previewImg.src = URL.createObjectURL(file);
  previewWrap.style.display = "block";
  dropLabel.textContent = file.name;
});

document.getElementById("itemForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const alertBox = document.getElementById("alertBox");
  const btn = document.getElementById("submitBtn");
  alertBox.innerHTML = "";
  btn.disabled = true;
  btn.textContent = "Publishing…";

  try {
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value.trim());
    formData.append("description", document.getElementById("description").value.trim());
    formData.append("category", document.getElementById("category").value);
    formData.append("pricePerDay", document.getElementById("pricePerDay").value);
    formData.append("condition", document.getElementById("condition").value);
    formData.append("location", document.getElementById("location").value.trim());
    if (imageInput.files[0]) formData.append("image", imageInput.files[0]);

    const item = await apiFetch("/items", { method: "POST", body: formData });
    toast("Item listed successfully");
    setTimeout(() => (window.location.href = `item-details.html?id=${item._id}`), 500);
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    btn.disabled = false;
    btn.textContent = "Publish listing";
  }
});
