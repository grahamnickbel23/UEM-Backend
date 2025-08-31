document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const otpForm = document.getElementById("otpForm");

    // --- LOGIN FORM ---
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            try {
                const response = await fetch("http://localhost:8000/auth/requestlogin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include' // allow cookies
                });

                const data = await response.json();

                if (data.success) {
                    console.log("Login successful. OTP sent to email.");

                    // Save email for OTP verification
                    sessionStorage.setItem("otpEmail", email);

                    // move to next page after success
                    window.location.href = "otp.html";
                } else {
                    alert(data.message || "Login failed. Try again.");
                }
            } catch (err) {
                console.error(err);
                alert("Error connecting to backend.");
            }
        });
    }

    // --- OTP FORM ---
    if (otpForm) {
        otpForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // get both email and otp
            const otp = otpForm.querySelector('input[type="text"]').value;
            const email = sessionStorage.getItem("otpEmail");

            // throw error if no email was found
            if (!email) {
                alert("Email not found. Please login again.");
                window.location.href = "index.html";
                return;
            }

            try {
                const response = await fetch("http://localhost:8000/auth/signin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp }),
                    credentials: 'include' // allow backend to set access & refresh cookies
                });

                const data = await response.json();

                if (data.success) {
                    console.log("OTP verified. Cookies set. Redirecting to profile page.");
                    window.location.href = "profile.html";
                } else {
                    alert(data.message || "OTP verification failed. Try again.");
                }

            } catch (err) {
                console.error(err);
                alert("Error connecting to backend for OTP verification.");
            }
        });
    }
});
