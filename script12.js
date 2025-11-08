document.addEventListener("DOMContentLoaded", () => {
  const openOverlayBtn = document.getElementById("openOverlayBtn");
  const closeOverlayBtn = document.getElementById("closeOverlayBtn");
  const overlay = document.getElementById("myOverlay");

  if (!openOverlayBtn || !overlay) return;

  // Open overlay
  openOverlayBtn.addEventListener("click", () => {
    overlay.style.display = "flex";
    overlay.classList.add("active");
  });

  // Close overlay
  if (closeOverlayBtn) {
    closeOverlayBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      overlay.classList.remove("active");
    });
  }

  // Optional: close overlay when clicking outside content
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.style.display = "none";
      overlay.classList.remove("active");
    }
  });
});
