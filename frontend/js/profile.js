requireAuth();

async function loadProfile() {
  try {
    const me = await apiFetch("/auth/me");
    document.getElementById("name").value = me.name || "";
    document.getElementById("email").value = me.email || "";
    document.getElementById("hostel").value = me.hostel || "";
    document.getElementById("phone").value = me.phone || "";
    document.getElementById("roleLabel").textContent = me.role;
  } catch (err) {
    toast(err.message, "error");
  }
}

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const alertBox = document.getElementById("alertBox");
  const btn = document.getElementById("submitBtn");
  alertBox.innerHTML = "";
  btn.disabled = true;
  btn.textContent = "Saving…";
  try {
    const updated = await apiFetch("/auth/me", {
      method: "PUT",
      body: JSON.stringify({
        name: document.getElementById("name").value.trim(),
        hostel: document.getElementById("hostel").value.trim(),
        phone: document.getElementById("phone").value.trim(),
      }),
    });
    const user = getUser();
    setSession({ ...user, name: updated.name }, getToken());
    toast("Profile updated");
    renderNavbar("profile");
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Save changes";
  }
});

document.getElementById("logoutBtn2").addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

loadProfile();
