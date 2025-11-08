// -------------------- Other User's Achievements Page --------------------

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1️⃣ Get selected user info from sessionStorage
    const selectedUser = JSON.parse(sessionStorage.getItem("selectedUser"));
    if (!selectedUser) throw new Error("No user selected");

    // 2️⃣ Prepare request payload for /api/auth/anyprofile
    const payload = {};
    payload[selectedUser.field] = selectedUser.value;

    const res = await fetch("/api/auth/anyprofile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include"
    });

    const data = await res.json();
    if (!data.success) throw new Error("Failed to fetch user data");

    const user = data.user;

    // 3️⃣ Profile Picture & Basic Info
    const profileAvatar = document.getElementById("profile-img");
    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .map(n => n.trim())
      .join("+");
    profileAvatar.src = `https://ui-avatars.com/api/?name=${fullName}&background=3E2723&color=E0B75D&size=225&rounded=true&bold=true`;

    document.getElementById("profile-name").textContent = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    document.getElementById("profile-dept").textContent = user.department || "N/A";
    document.getElementById("employee-id").textContent = user.employeeId || "N/A";
    document.getElementById("created-at").textContent = formatDate(user.createdAt);
    document.getElementById("updated-at").textContent = formatDate(user.updatedAt);

    // 4️⃣ Achievements Display
    const achievementsContainer = document.getElementById("achievements-container");
    achievementsContainer.innerHTML = "";

    if (Array.isArray(user.achivementSchema) && user.achivementSchema.length) {
      user.achivementSchema.forEach(ach => {
        const achDiv = document.createElement("div");
        achDiv.classList.add("achivement-info-details");

        const heading = document.createElement("h3");
        heading.textContent = ach.title || "Untitled Achievement";
        heading.classList.add("achivement-title");

        const organizer = document.createElement("p");
        organizer.textContent = `Organizer: ${ach.organizer || "N/A"}`;
        organizer.classList.add("achivement-desc");

        const viewBtn = document.createElement("button");
        viewBtn.textContent = "View Details";
        viewBtn.classList.add("achievement-view-btn");
        viewBtn.addEventListener("click", () => openAchievementOverlay(ach));

        achDiv.appendChild(heading);
        achDiv.appendChild(organizer);
        achDiv.appendChild(viewBtn);
        achievementsContainer.appendChild(achDiv);
      });
    } else {
      achievementsContainer.innerHTML = `<p class="no-achievement-text">No achievements found for this user.</p>`;
    }

  } catch (err) {
    console.error("Error loading other user's achievements:", err);
    alert("Failed to load achievements. Please try again.");
  }
});

// ---------------- Helper: Date Formatter ----------------
function formatDate(isoString) {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

// ---------------- Overlay Logic ----------------
const overlay = document.getElementById("achievement-overlay");
const closeOverlayBtn = document.getElementById("close-overlay");

async function openAchievementOverlay(ach) {
  try {
    const res = await fetch("/api/achivement/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: ach.title, url: ach.url }),
      credentials: "include"
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error("Failed to fetch achievement details");

    const a = data.message;

    // Fill overlay with achievement details
    document.getElementById("overlay-title").textContent = a.title || "Untitled";
    document.getElementById("overlay-type").textContent = a.achivementType || "N/A";
    document.getElementById("overlay-organizer").textContent = a.organizer || "N/A";
    document.getElementById("overlay-location").textContent = a.location || "N/A";
    document.getElementById("overlay-status").textContent = a.currentStatus || "N/A";
    document.getElementById("overlay-id").textContent = a.identification_number || "N/A";
    document.getElementById("overlay-desc").textContent = a.description || "No description available";
    document.getElementById("overlay-creator").textContent = a.createdBy || "N/A";

    const eventDate = a.eventDate ? new Date(a.eventDate) : null;
    document.getElementById("overlay-date").textContent = eventDate
      ? eventDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        })
      : "N/A";

    // 🧾 Instead of delete link, show PDFs & Images
    const overlayDoc = document.getElementById("overlay-doc");
    overlayDoc.textContent = "";
    overlayDoc.innerHTML = "";

    // --- PDFs ---
    if (a.docURL && Object.keys(a.docURL).length > 0) {
      const pdfHeader = document.createElement("h4");
      pdfHeader.textContent = "Documents:";
      overlayDoc.appendChild(pdfHeader);

      Object.entries(a.docURL).forEach(([name, url]) => {
        const link = document.createElement("a");
        link.href = url;
        link.textContent = `📄 ${name}`;
        link.target = "_blank";
        link.classList.add("achievement-link");
        overlayDoc.appendChild(link);
        overlayDoc.appendChild(document.createElement("br"));
      });
    }

    // --- Images ---
    if (a.imageURL && Object.keys(a.imageURL).length > 0) {
      const imgHeader = document.createElement("h4");
      imgHeader.textContent = "Images:";
      overlayDoc.appendChild(imgHeader);

      Object.entries(a.imageURL).forEach(([name, url]) => {
        const imgLink = document.createElement("a");
        imgLink.href = url;
        imgLink.textContent = `🖼️ ${name}`;
        imgLink.target = "_blank";
        imgLink.classList.add("achievement-link");
        overlayDoc.appendChild(imgLink);
        overlayDoc.appendChild(document.createElement("br"));
      });
    }

    overlay.style.display = "flex";
  } catch (err) {
    console.error("Error fetching achievement:", err);
    alert("Could not load achievement details.");
  }
}

// Close overlay
closeOverlayBtn.addEventListener("click", () => (overlay.style.display = "none"));
overlay.addEventListener("click", e => {
  if (e.target === overlay) overlay.style.display = "none";
});
