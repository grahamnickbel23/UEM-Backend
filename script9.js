//-------------------------------JS for search page----------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
    const userList = document.getElementById("user-list");

    // Get search query from sessionStorage if available
    const searchQuery = sessionStorage.getItem("searchQuery")?.trim().toLowerCase() || "";

    try {
        const res = await fetch("/api/auth/alluser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });

        const data = await res.json();

        if (!data.success) {
            userList.innerHTML = `<p class="search-error">Error fetching data. Please try again later.</p>`;
            return;
        }

        // Format user data directly from API response
        const formattedUsers = data.message.map(user => ({
            name: user.name || "Unknown",
            employeeId: user.employeeId || "N/A",
            department: user.department || "N/A"
        }));

        // Optional: filter by search query
        const filteredUsers = searchQuery
            ? formattedUsers.filter(u =>
                u.name.toLowerCase().includes(searchQuery) ||
                u.employeeId.toLowerCase().includes(searchQuery) ||
                u.department.toLowerCase().includes(searchQuery)
            )
            : formattedUsers;

        // Render users
        if (filteredUsers.length === 0) {
            userList.innerHTML = `<p class="search-no-result">No users found for "${searchQuery}"</p>`;
            return;
        }

        filteredUsers.forEach(user => {
            const userDiv = document.createElement("div");
            userDiv.classList.add("search-user-card");

            const fullName = user.name?.trim().replace(/\s+/g, "+") || "User";

            userDiv.innerHTML = `
                <img src="https://ui-avatars.com/api/?name=${fullName}&background=3E2723&color=E0B75D&size=64&rounded=true&bold=true" 
             alt="${user.name}" class="avatar">
             <div class="search-user-info">
             <div class="search-user-main">
                <span>${user.name}</span>
                <span>${user.department}</span>
             </div>
             <div class="search-user-sub">
                 Employee ID: ${user.employeeId}
             </div>
             </div>
             `;

            userDiv.addEventListener("click", () => {
                sessionStorage.setItem("selectedUser", JSON.stringify({
                    field: "employeeId",
                    value: user.employeeId
                }));
                window.location.href = "otherProfile.html";
            });

            userList.appendChild(userDiv);
        });

    } catch (err) {
        console.error("Error loading users:", err);
        userList.innerHTML = `<p class="search-error">Failed to load users.</p>`;
    }
});
