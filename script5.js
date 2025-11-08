// ---------------- Upload Form Submit ----------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Create fresh FormData from form
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
        credentials: "include", // optional if cookies used
      });

      const data = await res.json();
      console.log("Server Response:", data);

      if (data.success) {
        alert(`✅ User Created Successfully!\nName: ${data.user.firstName} ${data.user.lastName}`);
        form.reset();
      } else {
        alert("❌ Failed to create user. Please check input values.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("⚠️ Something went wrong. Check console for details.");
    }
  });
});

// ----------------------- Achievement Form Submit -----------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadAchivementForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Create fresh FormData from the form
    const formData = new FormData(form);

    try {
      // Retrieve user info from localStorage
      const localInfo = JSON.parse(localStorage.getItem("localData"));
      const userId = localInfo.user._id;

      if (!userId) {
        alert("User ID not found. Please re-login or refresh the page.");
        return;
      }

      // Append user ID to form data under key "person"
      formData.append("person", userId);

      const res = await fetch("/api/achivement/creation", {
        method: "POST",
        body: formData,
        credentials: "include", // needed if cookies/session used
      });

      const data = await res.json();
      console.log("Server Response:", data);

      if (data.success) {
        alert("✅ Achievement Created Successfully!");
        form.reset();
      } else {
        alert("❌ Failed to create achievement. Please check input values.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("⚠️ Something went wrong. Check console for details.");
    }
  });
});
