const API_BASE_URL = "http://localhost:8081";

function showToast(title, message, type = "success") {
    const toast = document.getElementById("toast");
    const tTitle = document.getElementById("toast-title");
    const tMsg = document.getElementById("toast-message");
    tTitle.textContent = title;
    tMsg.textContent = message;
    toast.className = "toast";
    if (type === "success") toast.classList.add("toast-success");
    if (type === "error") toast.classList.add("toast-error");
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 3000);
}

async function apiRegister(payload) {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Registration failed");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("link-login").addEventListener("click", () => {
        window.location.href = "login.html";
    });

    document.getElementById("btn-register").addEventListener("click", async () => {
        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value;
        const phoneNumber = document.getElementById("reg-phone").value.trim();
        const city = document.getElementById("reg-city").value.trim();
        const role = document.getElementById("reg-role").value; // USER or HELPER

        if (!name || !email || !password || !city) {
            showToast("Missing data", "Name, email, password and city are required.", "error");
            return;
        }

        const payload = {
            name,
            email,
            password,
            phoneNumber,
            city,
            role
        };

        try {
            await apiRegister(payload);
            showToast("Registered", "Account created. You can now log in.", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        } catch (err) {
            console.error(err);
            showToast("Registration failed", err.message || "Please try again.", "error");
        }
    });

    // If you keep the <form>, make sure submit doesn't reload page:
    const form = document.getElementById("register-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // just in case
    });
});
