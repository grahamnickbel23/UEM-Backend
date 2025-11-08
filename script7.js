// ------------------------Search--------------------
const searchBox = document.getElementById("search-box");
const suggestions = document.getElementById("search-suggestions");

let debounceTimer;
let latestSuggestions = []; // store fetched suggestions

// Debounce function
function debounce(func, delay) {
    return (...args) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Fetch search suggestions
async function fetchSuggestions(query) {
    if (!query.trim()) {
        hideSuggestions();
        latestSuggestions = [];
        return;
    }

    try {
        const res = await fetch("/api/auth/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ query })
        });

        const data = await res.json();
        if (data.success) {
            latestSuggestions = data.message || [];
            showSuggestions(latestSuggestions);
        } else {
            latestSuggestions = [];
            hideSuggestions();
        }
    } catch (err) {
        console.error("Error fetching search suggestions:", err);
        hideSuggestions();
    }
}

// Show suggestions dropdown
function showSuggestions(items) {
    suggestions.classList.add("show");
    suggestions.style.display = "block";
    suggestions.innerHTML = "";
    if (!items.length) return;

    items.forEach(item => {
        const li = document.createElement("li");

        // --- Create avatar ---
        const fullName = item.name?.trim().replace(/\s+/g, "+") || "User";
        const img = document.createElement("img");
        img.src = `https://ui-avatars.com/api/?name=${fullName}&background=3E2723&color=E0B75D&size=64&rounded=true&bold=true`;
        img.alt = item.name || "User";
        img.classList.add("suggestion-avatar");

        // --- Create text spans ---
        const nameSpan = document.createElement("span");
        nameSpan.classList.add("suggestion-name");
        nameSpan.textContent = item.name || "Unknown";

        const metaSpan = document.createElement("span");
        metaSpan.classList.add("suggestion-meta");
        metaSpan.textContent = `${item.matchedField}: ${item.matchedValue}`;

        // --- Combine all horizontally ---
        li.appendChild(img);
        li.appendChild(nameSpan);
        li.appendChild(metaSpan);

        li.addEventListener("click", () => {
            sessionStorage.setItem("selectedUser", JSON.stringify({
                field: item.matchedField,
                value: item.matchedValue
            }));
            window.location.href = "otherProfile.html";
        });

        suggestions.appendChild(li);
    });
}

// Hide suggestions dropdown
function hideSuggestions() {
    suggestions.classList.remove("show");
    suggestions.innerHTML = "";
    suggestions.style.display = "none";
}

// Attach input listener with debounce
searchBox.addEventListener("input", debounce((e) => {
    fetchSuggestions(e.target.value);
}, 300));

// Hide suggestions when clicking outside
document.addEventListener("click", (event) => {
    if (!searchBox.contains(event.target) && !suggestions.contains(event.target)) {
        hideSuggestions();
    }
});

// Redirect on Enter key
searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const query = searchBox.value.trim();
        if (!query) return;

        // Check for exact match with any suggestion
        const exactMatch = latestSuggestions.find(item =>
            [item.matchedValue, item.employeeId, item.email, item.phone]
                .filter(Boolean)
                .some(val => val.toLowerCase() === query.toLowerCase())
        );

        if (exactMatch) {
            // Redirect directly to otherProfile.html
            sessionStorage.setItem("selectedUser", JSON.stringify({
                field: exactMatch.matchedField,
                value: exactMatch.matchedValue
            }));
            window.location.href = "otherProfile.html";
        } else {
            // Redirect to search.html
            sessionStorage.setItem("searchQuery", query);
            window.location.href = "search.html";
        }
    }
});
