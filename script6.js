//--------------- achivement + search page-------------

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    const data = await response.json();
    localStorage.setItem('localData', JSON.stringify(data));
    if (!data.success) throw new Error("Failed to fetch user data");
    const user = data.user;

    // --- Profile Picture or Initials ---
    const profileAvatar = document.getElementById("profile-img");
    const fullName = [user.firstName, user.lastName].filter(Boolean).map(n => n.trim()).join("+");
    profileAvatar.src = `https://ui-avatars.com/api/?name=${fullName}&background=3E2723&color=E0B75D&size=225&rounded=true&bold=true`;


    // Fill profile fields
    document.getElementById("profile-name").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("profile-dept").textContent = user.department || "N/A";
    document.getElementById("employee-id").textContent = user.employeeId || "N/A";

    // Timestamps
    document.getElementById("created-at").textContent = formatDate(user.createdAt);
    document.getElementById("updated-at").textContent = formatDate(user.updatedAt);

    // Container where all achievements will be added
    const achievementsContainer = document.getElementById("achievements-container");

    // Loop through user's achievements and create divs
    if (Array.isArray(user.achivementSchema) && user.achivementSchema.length) {
      user.achivementSchema.forEach(ach => {

        // Create the main div for this achievement
        const achDiv = document.createElement("div");
        achDiv.classList.add("achivement-info-details");

        // Heading - Achievement Title
        const heading = document.createElement("h3");
        heading.textContent = ach.title || "Untitled Achievement";
        heading.classList.add("achivement-title");

        // Organizer Info
        const organizer = document.createElement("p");
        organizer.textContent = `Id: ${ach.url || "N/A"}`;
        organizer.classList.add("achivement-desc");

        // Optional: Add a button or clickable div to open modal
        const viewBtn = document.createElement("button");
        viewBtn.textContent = "View Details";
        viewBtn.classList.add("achievement-view-btn");
        viewBtn.addEventListener("click", () => {
          openAchievementOverlay(ach);
        });

        // Append elements to achievement div
        achDiv.appendChild(heading);
        achDiv.appendChild(organizer);
        achDiv.appendChild(viewBtn);

        // Append achievement div to container
        achievementsContainer.appendChild(achDiv);
      });
    }

  } catch (err) {
    console.error("Error fetching user profile:", err);
  }
});

function formatDate(isoString) {
  if (!isoString) return "N/A";
  const d = new Date(isoString);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

// --- Achievement Modal Logic ---
const overlay = document.getElementById("achievement-overlay");
const closeOverlayBtn = document.getElementById("close-overlay");
let currentAchievement = null;

async function openAchievementOverlay(ach) {
  currentAchievement = ach; // save reference for later deletion
  try {
    const res = await fetch("/api/achivement/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: ach.title, url: ach.url }),
      credentials: "include"
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error("Failed to fetch achievement details");

    // Fill overlay content
    document.getElementById("overlay-title").textContent = data.message.title;
    document.getElementById("overlay-type").textContent = data.message.achivementType || "N/A";
    document.getElementById("overlay-organizer").textContent = data.message.organizer || "N/A";
    document.getElementById("overlay-location").textContent = data.message.location || "N/A";
    document.getElementById("overlay-status").textContent = data.message.currentStatus || "N/A";
    document.getElementById("overlay-id").textContent = data.message.identification_number || "N/A";
    const dateItem = new Date(data.message.createdAt);
    document.getElementById("overlay-date").textContent = dateItem.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }) || 'N/A';
    document.getElementById("overlay-creator").textContent = data.message.createdBy || "N/A";
    document.getElementById("overlay-desc").textContent = data.message.description || "No description available";

    overlay.style.display = "flex";
  } catch (err) {
    console.error("Error fetching achievement:", err);
    alert("Could not load achievement details.");
  }
}

// Close overlay on click
closeOverlayBtn.addEventListener("click", () => {
  overlay.style.display = "none";
});

// Optional: Close when clicking outside modal
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) overlay.style.display = "none";
});

// delete document
const deleteDoc = document.getElementById("overlay-doc");
deleteDoc.addEventListener("click", () => deleteDocument(currentAchievement));

async function deleteDocument(ach) {
  if (!ach) return alert("No achievement selected!");

  if (!confirm(`Are you sure you want to delete "${ach.title}"?`)) return;

  try {
    const res = await fetch("/api/achivement/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: ach.title, url: ach.url }),
      credentials: "include"
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");

    alert("Achievement deleted successfully!");
    overlay.style.display = "none";

    // Optionally remove from DOM
    const achievementsContainer = document.getElementById("achievements-container");
    achievementsContainer.querySelectorAll(".achivement-info-details").forEach(div => {
      if (div.querySelector("h3").textContent === ach.title) div.remove();
    });

  } catch (err) {
    console.error("Error deleting achievement:", err);
    alert("Could not delete achievement.");
  }
}


// --- Helper functions ---
function formatDate(isoString) {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    hour12: false,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}