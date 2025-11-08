//---------------profile page-------------

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    const data = await response.json();
    if (!data.success) throw new Error("Failed to fetch user data");
    const user = data.user;

    // --- Profile Picture or Initials ---
    const profileAvatar = document.getElementById("profile-img");
    const fullName = [user.firstName, user.lastName].filter(Boolean).map(n => n.trim()).join("+");
    profileAvatar.src = `https://ui-avatars.com/api/?name=${fullName}&background=3E2723&color=E0B75D&size=225&rounded=true&bold=true`;


    // Fill profile fields
    document.getElementById("profile-dept").textContent = `Dept: ${user.department}` || "N/A";
    document.getElementById("profile-name").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("profile-gender").textContent = user.gender || "N/A";
    document.getElementById("profile-role").textContent = user.role || "N/A";
    document.getElementById("employee-id").textContent = user.employeeId || "N/A";
    document.getElementById("email").textContent = Array.isArray(user.email) ? user.email[0] : user.email;
    document.getElementById("phone").textContent = Array.isArray(user.phone) && user.phone.length ? `+${user.phone[0].countryCode} ${user.phone[0].mobileNumber}` : "N/A";

    const dob = new Date(user.date_of_birth);
    document.getElementById("date-of-birth").textContent = dob.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    // Address
    const addr = Array.isArray(user.address) && user.address.length ? user.address[0] : null;

    document.getElementById("address-line1").textContent = addr?.address_line_one || "N/A";
    document.getElementById("address-line2").textContent = addr?.address_line_two || "N/A";
    document.getElementById("address-line3").textContent = addr?.address_line_three || "N/A";
    document.getElementById("district").textContent = addr?.district || "N/A";
    document.getElementById("state").textContent = addr?.state || "N/A";
    document.getElementById("country").textContent = addr?.country || "N/A";


    // Timestamps
    document.getElementById("created-by").textContent = user.createdBy || "N/A";
    document.getElementById("created-at").textContent = formatDate(user.createdAt);
    document.getElementById("updated-at").textContent = formatDate(user.updatedAt);

    // Social Links
    const githubLink = document.getElementById("github-link");
    const linkedinLink = document.getElementById("linkedin-link");

    githubLink.href = user.githubURL;
    githubLink.target = "_blank"; // open in new tab

    linkedinLink.href = user.linkdinURL;
    linkedinLink.target = "_blank"; // open in new tab

    // Container where all achievements will be added
    const achievementsContainer = document.getElementById("achievements-container");

    // Loop through user's achievements and create divs
    if (Array.isArray(user.achivementSchema) && user.achivementSchema.length) {
      user.achivementSchema.forEach(ach => {

        // Create the main div for this achievement
        const achDiv = document.createElement("div");
        achDiv.classList.add("achievement-card");

        // Heading - Achievement Title
        const heading = document.createElement("h3");
        heading.textContent = ach.title || "Untitled Achievement";
        heading.classList.add("achievement-title");

        // Organizer Info
        const organizer = document.createElement("p");
        organizer.textContent = `Organizer: ${ach.organizer || "N/A"}`;
        organizer.classList.add("achievement-organizer");

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

// Function to open overlay and fetch detailed info
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

    // Fill overlay content
    document.getElementById("overlay-title").textContent = data.message.title;
    document.getElementById("overlay-organizer").textContent = data.message.organizer || "N/A";
    document.getElementById("overlay-location").textContent = data.message.location || "N/A";
    document.getElementById("overlay-status").textContent = data.message.currentStatus || "N/A";
    document.getElementById("overlay-id").textContent = data.message.identification_number || "N/A";
    document.getElementById("overlay-desc").textContent = data.message.description || "No description available";
    document.getElementById("overlay-doc").href = "achivement.html";

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

// Attach input listener with debounce
searchBox.addEventListener("input", debounce((e) => {
  fetchSuggestions(e.target.value);
}, 300));