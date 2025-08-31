document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Show loading state
        showLoadingState();

        // Get the email from sessionStorage
        const email = sessionStorage.getItem("otpEmail");

        if (!email) {
            throw new Error("No email found in session. Please login again.");
        }

        console.log("Making API call at:", new Date().toISOString());

        // Send email in request body using POST
        const response = await fetch("http://localhost:8000/auth/profile", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.user) {
            populateProfile(data.user);
            hideLoadingState();
        } else {
            throw new Error(data.message || "Failed to load profile data");
        }

    } catch (err) {
        console.error("Error fetching profile:", err);
        showErrorState(err.message);
    }
});

function showLoadingState() {
    // Show loading indicators
    document.getElementById("fullName").textContent = "Loading...";
    document.getElementById("designation").textContent = "Loading...";
    document.getElementById("department").textContent = "Loading...";
}

function hideLoadingState() {
    // Loading state will be replaced by actual data
    console.log("Profile loaded successfully");
}

function showErrorState(errorMessage) {
    document.getElementById("fullName").textContent = "Error loading profile";
    document.getElementById("designation").textContent = errorMessage;

    // You could also show a proper error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText = "background: #fee; color: #c33; padding: 10px; margin: 10px; border-radius: 4px;";
    errorDiv.textContent = `Error: ${errorMessage}. Please refresh the page or contact support.`;
    document.querySelector(".profile-container").prepend(errorDiv);
}

function populateProfile(user) {
    // Update department
    document.getElementById("department").textContent = user.department || "Department Name";

    // Update name - handle middle name properly
    const middleName = user.middleName ? ` ${user.middleName} ` : " ";
    document.getElementById("fullName").textContent = `${user.firstName || "Guest"}${middleName}${user.lastName || "User"}`;

    // Update designation/role
    document.getElementById("designation").textContent = user.role || "Faculty";

    // onine image pull if no image was there
    function getDefaultAvatar(firstName = "User", lastName = "") {
        const name = `${firstName} ${lastName}`.trim() || "User";
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=150&background=007bff&color=ffffff`;
    }

    // Update profile picture
    const profilePic = document.getElementById("profilePic");
    profilePic.src = user.profilePicURL || getDefaultAvatar(user.firstName, user.lastName);

    profilePic.onerror = () => {
        profilePic.src = getDefaultAvatar(user.firstName, user.lastName);
    };

    // Update address
    if (user.address && user.address.length > 0) {
        const addr = user.address[0];
        const addressParts = [
            addr.address_line_one,
            addr.district,
            addr.state,
            addr.country
        ].filter(part => part); // Remove empty parts

        document.getElementById("address").textContent = addressParts.join(", ");
    } else {
        document.getElementById("address").textContent = "Address not provided";
    }

    // Update contact info
    let contactInfo = "";

    // Handle email - check if it's an array or string
    if (user.email) {
        const emails = Array.isArray(user.email) ? user.email : [user.email];
        contactInfo += `Email: ${emails.join(", ")}`;
    }

    // Handle phone numbers
    if (user.phone && user.phone.length > 0) {
        const phones = user.phone.map(p => `+${p.countryCode}-${p.mobileNumber}`);
        contactInfo += contactInfo ? ` | Phone: ${phones.join(", ")}` : `Phone: ${phones.join(", ")}`;
    }

    document.getElementById("contact").textContent = contactInfo || "Contact info not provided";

    // Update date of birth
    if (user.date_of_birth) {
        const dob = new Date(user.date_of_birth);
        document.getElementById("dob").textContent = `Date of Birth: ${dob.toLocaleDateString()}`;
    } else {
        document.getElementById("dob").textContent = "Date of Birth: Not provided";
    }

    // Update gender
    document.getElementById("gender").textContent = `Gender: ${user.gender || "Prefer not to say"}`;

    // Update social links
    const githubElement = document.getElementById("github");
    if (user.githubURL) {
        githubElement.innerHTML = `<a href="${user.githubURL}" target="_blank" rel="noopener noreferrer">GitHub</a>`;
    } else {
        githubElement.innerHTML = "";
    }

    const linkedinElement = document.getElementById("linkedin");
    if (user.linkdinURL) {
        linkedinElement.innerHTML = `<a href="${user.linkdinURL}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`;
    } else {
        linkedinElement.innerHTML = "";
    }

    // Update achievements
    const achievementsList = document.getElementById("achievementsList");
    achievementsList.innerHTML = ""; // Clear existing content

    if (user.achivementSchema && user.achivementSchema.length > 0) {
        user.achivementSchema.forEach(achievement => {
            const li = document.createElement("li");
            li.textContent = achievement.title || "Untitled Achievement";
            achievementsList.appendChild(li);
        });
    } else {
        const li = document.createElement("li");
        li.textContent = "No achievements yet.";
        li.style.fontStyle = "italic";
        li.style.color = "#666";
        achievementsList.appendChild(li);
    }
}

// Optional: Add a retry function
function retryLoadProfile() {
    location.reload(); // Simple refresh, or you could call the load function again
}