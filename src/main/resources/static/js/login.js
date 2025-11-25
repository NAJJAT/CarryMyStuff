const API_BASE_URL = "http://localhost:8081"; // adjust if needed

function showToast(title, message, type = "success") {
    const toast = document.getElementById("toast");
    const titleEl = document.getElementById("toast-title");
    const messageEl = document.getElementById("toast-message");
    titleEl.textContent = title;
    messageEl.textContent = message;
    toast.className = "toast";
    if (type === "success") toast.classList.add("toast-success");
    if (type === "error") toast.classList.add("toast-error");
    toast.style.display = "block";
    setTimeout(() => (toast.style.display = "none"), 3000);
}

async function login(email, password) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Login failed");
    }
    const data = await res.json();
    return data.token;
}

async function fetchCurrentUser(token) {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch current user");
    return await res.json();
}

window.addEventListener("DOMContentLoaded", async () => {
    // if token already exists, skip login & redirect
    const stored = localStorage.getItem("jwt");
    if (stored) {
        try {
            const me = await fetchCurrentUser(stored);
            redirectByRole(me.role);
            return;
        } catch {
            localStorage.removeItem("jwt");
        }
    }

    document.getElementById("link-register").addEventListener("click", () => {
        window.location.href = "register.html";
    });

    document.getElementById("btn-login").addEventListener("click", async () => {
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        if (!email || !password) {
            showToast("Missing data", "Please fill email and password.", "error");
            return;
        }
        try {
            const token = await login(email, password);
            localStorage.setItem("jwt", token);
            const me = await fetchCurrentUser(token);
            showToast("Welcome", `Logged in as ${me.role}`, "success");
            redirectByRole(me.role);
        } catch (err) {
            console.error(err);
            showToast("Login failed", err.message || "Check your credentials.", "error");
        }
    });
});

function redirectByRole(role) {
    const r = (role || "").toUpperCase();
    if (r === "USER") {
        window.location.href = "user-dashboard.html";
    } else if (r === "HELPER") {
        window.location.href = "helper-dashboard.html";
    } else if (r === "ADMIN") {
        window.location.href = "admin-dashboard.html";
    } else {
        showToast("Unknown role", `Role "${role}" is not handled.`, "error");
    }
}
