// ===== CONFIG =====
const API_BASE_URL = "http://localhost:8081"; // change if needed

let token = null;
let currentUser = null; // { email, role, name, ... }

// ===== UI HELPERS =====
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
    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

function updateAuthUI() {
    const badge = document.getElementById("auth-badge");
    const dot = document.getElementById("auth-status-dot");
    const statusText = document.getElementById("auth-status-text");
    const emailEl = document.getElementById("auth-email");
    const roleHint = document.getElementById("welcome-role-hint");

    if (token && currentUser) {
        badge.classList.remove("auth-badge--logged-out");
        badge.classList.add("auth-badge--logged-in");
        dot.style.backgroundColor = "#22c55e";
        statusText.textContent = `Logged in as ${currentUser.role}`;
        emailEl.textContent = currentUser.email;
        roleHint.textContent = `You are logged in as ${currentUser.role}. Your dashboard is on the right.`;
    } else {
        badge.classList.remove("auth-badge--logged-in");
        badge.classList.add("auth-badge--logged-out");
        dot.style.backgroundColor = "#ef4444";
        statusText.textContent = "Not logged in";
        emailEl.textContent = "";
        roleHint.textContent = "Please log in to see your dashboard.";
    }
}

function showDashboardForRole(role) {
    const userPanel = document.getElementById("panel-user");
    const helperPanel = document.getElementById("panel-helper");
    const adminPanel = document.getElementById("panel-admin");

    userPanel.classList.add("hidden");
    helperPanel.classList.add("hidden");
    adminPanel.classList.add("hidden");

    if (!role) return;

    const r = role.toUpperCase();

    if (r === "USER") {
        userPanel.classList.remove("hidden");
        loadUserDashboard();
    } else if (r === "HELPER") {
        helperPanel.classList.remove("hidden");
        loadHelperDashboard();
    } else if (r === "ADMIN") {
        adminPanel.classList.remove("hidden");
        loadAdminDashboard();
    }
}

function toApiDate(datetimeLocalValue) {
    if (!datetimeLocalValue) return null;
    // input "2025-12-01T10:00" -> "2025-12-01T10:00:00"
    return datetimeLocalValue + ":00";
}

function formatStatusTagClass(status) {
    if (!status) return "";
    const s = status.toUpperCase();
    if (s === "PENDING") return "tag-status-pending";
    if (s === "ACCEPTED") return "tag-status-accepted";
    if (s === "CANCELED") return "tag-status-canceled";
    if (s === "DONE") return "tag-status-done";
    return "";
}

function formatDateTime(dtString) {
    if (!dtString) return "";
    try {
        const d = new Date(dtString);
        return d.toLocaleString();
    } catch {
        return dtString;
    }
}

// ===== API CALLS =====
async function apiLogin(email, password) {
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

async function apiGetCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
        throw new Error("Failed to load current user");
    }
    return await res.json();
}

async function apiGetAllActiveVehicles() {
    const res = await fetch(`${API_BASE_URL}/api/user/vehicles/all`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load vehicles");
    return await res.json();
}

async function apiCreateBooking(vehicleId, fromAddress, toAddress, moveDate) {
    const res = await fetch(`${API_BASE_URL}/api/user/bookings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ vehicleId, fromAddress, toAddress, moveDate })
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create booking");
    }
    return await res.json();
}

async function apiGetMyBookings() {
    const res = await fetch(`${API_BASE_URL}/api/user/bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load bookings");
    return await res.json();
}

async function apiGetHelperBookings() {
    const res = await fetch(`${API_BASE_URL}/api/helper/bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load helper bookings");
    return await res.json();
}

async function apiGetAdminBookings() {
    const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load all bookings");
    return await res.json();
}

// ===== RENDER FUNCTIONS =====
function renderVehicles(list) {
    const container = document.getElementById("user-vehicles-list");
    container.innerHTML = "";
    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-muted small">No active vehicles found.</p>`;
        return;
    }
    list.forEach(v => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
            <div class="list-item-title">Vehicle #${v.id} – ${v.type || "Unknown type"}</div>
            <div class="list-item-meta">${v.city || "-"}</div>
            <div class="list-item-tags">
                <span class="tag tag-strong">
                    Capacity: ${v.capacityKg != null ? v.capacityKg + " kg" : "N/A"}
                </span>
                ${v.licensePlate ? `<span class="tag">Plate: ${v.licensePlate}</span>` : ""}
                ${v.description ? `<span class="tag">${v.description}</span>` : ""}
            </div>
        `;
        container.appendChild(div);
    });
}

function renderBookings(list, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-muted small">No bookings found.</p>`;
        return;
    }
    list.forEach(b => {
        const div = document.createElement("div");
        div.className = "list-item";
        const statusClass = formatStatusTagClass(b.status);
        const moveDate = formatDateTime(b.moveDate);

        div.innerHTML = `
            <div class="list-item-title">Booking #${b.id || ""}</div>
            <div class="list-item-meta">
                ${b.fromAddress || ""} → ${b.toAddress || ""}
            </div>
            <div class="list-item-meta">${moveDate}</div>
            <div class="list-item-tags">
                <span class="tag ${statusClass}">Status: ${b.status || "UNKNOWN"}</span>
                ${b.vehicle && b.vehicle.id ? `<span class="tag">Vehicle #${b.vehicle.id}</span>` : ""}
                ${b.customer && b.customer.email ? `<span class="tag">User: ${b.customer.email}</span>` : ""}
                ${b.helper && b.helper.email ? `<span class="tag">Helper: ${b.helper.email}</span>` : ""}
            </div>
        `;
        container.appendChild(div);
    });
}

// ===== DASHBOARD LOADERS =====
async function loadUserDashboard() {
    try {
        const vehicles = await apiGetAllActiveVehicles();
        renderVehicles(vehicles);

        const bookings = await apiGetMyBookings();
        renderBookings(bookings, "bookings-list");
    } catch (err) {
        console.error(err);
        showToast("Error", "Could not load user data.", "error");
    }
}

async function loadHelperDashboard() {
    try {
        const bookings = await apiGetHelperBookings();
        renderBookings(bookings, "helper-bookings-list");
    } catch (err) {
        console.error(err);
        showToast("Error", "Could not load helper bookings.", "error");
    }
}

async function loadAdminDashboard() {
    try {
        const bookings = await apiGetAdminBookings();
        renderBookings(bookings, "admin-bookings-list");
    } catch (err) {
        console.error(err);
        showToast("Error", "Could not load admin bookings.", "error");
    }
}

// ===== EVENT BINDINGS =====
window.addEventListener("DOMContentLoaded", async () => {
    // Try to restore token
    const stored = localStorage.getItem("jwt");
    if (stored) {
        token = stored;
        try {
            currentUser = await apiGetCurrentUser();
            updateAuthUI();
            showDashboardForRole(currentUser.role);
        } catch (err) {
            console.warn("Stored token invalid:", err);
            token = null;
            currentUser = null;
            localStorage.removeItem("jwt");
            updateAuthUI();
        }
    } else {
        updateAuthUI();
    }

    // Login
    document.getElementById("btn-login").addEventListener("click", async () => {
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        if (!email || !password) {
            showToast("Missing data", "Please enter email and password.", "error");
            return;
        }

        try {
            const t = await apiLogin(email, password);
            token = t;
            localStorage.setItem("jwt", t);

            currentUser = await apiGetCurrentUser();
            updateAuthUI();
            showToast("Logged in", `Welcome, ${currentUser.name || currentUser.email}!`, "success");
            showDashboardForRole(currentUser.role);
        } catch (err) {
            console.error(err);
            showToast("Login failed", err.message || "Check your credentials.", "error");
        }
    });

    // Logout
    document.getElementById("btn-logout").addEventListener("click", () => {
        token = null;
        currentUser = null;
        localStorage.removeItem("jwt");
        updateAuthUI();
        showDashboardForRole(null);
        showToast("Logged out", "You have been logged out.", "success");
    });

    // User: load vehicles
    const btnLoadVehicles = document.getElementById("btn-user-load-vehicles");
    if (btnLoadVehicles) {
        btnLoadVehicles.addEventListener("click", async () => {
            try {
                const vehicles = await apiGetAllActiveVehicles();
                renderVehicles(vehicles);
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not load vehicles.", "error");
            }
        });
    }

    // User: create booking
    const btnCreateBooking = document.getElementById("btn-create-booking");
    if (btnCreateBooking) {
        btnCreateBooking.addEventListener("click", async () => {
            const vehicleIdVal = document.getElementById("booking-vehicle-id").value;
            const fromAddress = document.getElementById("booking-from").value.trim();
            const toAddress = document.getElementById("booking-to").value.trim();
            const dateVal = document.getElementById("booking-date").value;

            if (!vehicleIdVal || !fromAddress || !toAddress || !dateVal) {
                showToast("Missing data", "Please fill all booking fields.", "error");
                return;
            }

            const vehicleId = Number(vehicleIdVal);
            const moveDate = toApiDate(dateVal);

            try {
                await apiCreateBooking(vehicleId, fromAddress, toAddress, moveDate);
                showToast("Booking created", "Your booking has been created.", "success");
                const bookings = await apiGetMyBookings();
                renderBookings(bookings, "bookings-list");
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not create booking.", "error");
            }
        });
    }

    // User: refresh bookings
    const btnRefreshBookings = document.getElementById("btn-refresh-bookings");
    if (btnRefreshBookings) {
        btnRefreshBookings.addEventListener("click", async () => {
            try {
                const bookings = await apiGetMyBookings();
                renderBookings(bookings, "bookings-list");
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not load bookings.", "error");
            }
        });
    }

    // Helper: refresh
    const btnRefreshHelper = document.getElementById("btn-refresh-helper-bookings");
    if (btnRefreshHelper) {
        btnRefreshHelper.addEventListener("click", async () => {
            try {
                const bookings = await apiGetHelperBookings();
                renderBookings(bookings, "helper-bookings-list");
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not load helper bookings.", "error");
            }
        });
    }

    // Admin: refresh
    const btnRefreshAdmin = document.getElementById("btn-refresh-admin-bookings");
    if (btnRefreshAdmin) {
        btnRefreshAdmin.addEventListener("click", async () => {
            try {
                const bookings = await apiGetAdminBookings();
                renderBookings(bookings, "admin-bookings-list");
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not load admin bookings.", "error");
            }
        });
    }
});
