document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("downloadBtn");
    const overlay = document.getElementById("downloadOverlay");
    const cancelBtn = overlay.querySelector(".download-cancel");
    const downloadForm = document.getElementById("downloadForm");

    openBtn.addEventListener("click", () => {
        overlay.classList.add("active");
    });

    cancelBtn.addEventListener("click", () => {
        overlay.classList.remove("active");
    });


    downloadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const type = document.getElementById("achievementType").value;
        const order = document.getElementById("orderType").value;

        if (!type) return alert("Please select an achievement type.");

        try {
            const res = await fetch("/api/auth/downloaduser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, order }),
                credentials: "include"
            });

            if (!res.ok) throw new Error("Failed to download");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${type}-achievement-report.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            alert("Error downloading file. Try again.");
        }
    });
});
