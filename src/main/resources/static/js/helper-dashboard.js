// ======================
// CONFIG
// ======================
const API_BASE_URL = "http://localhost:8081";

// ======================
// TOAST HELPERS
// ======================
function showToast(title, message, type = "success") {
    const toast = document.getElementById("toast");
    const titleEl = document.getElementById("toast-title");
    const messageEl = document.getElementById("toast-message");

    if (!toast || !titleEl || !messageEl) return;

    toast.className = "toast";
    if (type === "success") toast.classList.add("toast-success");
    if (type === "error") toast.classList.add("toast-error");

    titleEl.textContent = title;
    messageEl.textContent = message;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
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

function formatDateTime(dt) {
    if (!dt) return "";
    try {
        return new Date(dt).toLocaleString();
    } catch {
        return dt;
    }
}

// ======================
// API CALLS
// ======================
async function apiGetCurrentUser(token) {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Failed to fetch current user");
    return await res.json();
}

async function apiGetHelperBookings(token) {
    const res = await fetch(`${API_BASE_URL}/api/helper/bookings`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Failed to load helper bookings");
    return await res.json();
}

async function apiGetHelperVehicles(token) {
    const res = await fetch(`${API_BASE_URL}/api/helper/vehicles`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    if (!res.ok) throw new Error("Failed to load helper vehicles");
    return await res.json();
}

async function apiCreateHelperVehicle(token, vehicle) {
    console.log("➡️ Sending vehicle payload:", vehicle);

    const res = await fetch(`${API_BASE_URL}/api/helper/vehicles`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(vehicle)
    });

    const text = await res.text(); // for debugging
    console.log("⬅️ Response status:", res.status, "body:", text);

    if (!res.ok) {
        throw new Error(text || "Failed to create vehicle");
    }

    // if backend returns JSON body, parse it
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

// ======================
// RENDER FUNCTIONS
// ======================
function renderBookings(list) {
    const container = document.getElementById("helper-bookings-list");
    if (!container) return;

    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-muted small">No bookings yet.</p>`;
        return;
    }

    list.forEach(b => {
        const div = document.createElement("div");
        div.className = "list-item";
        const statusClass = formatStatusTagClass(b.status);

        div.innerHTML = `
            <div class="list-item-title">Booking #${b.id}</div>
            <div class="list-item-meta">
                ${b.fromAddress || ""} → ${b.toAddress || ""}
            </div>
            <div class="list-item-meta">
                ${formatDateTime(b.moveDate)}
            </div>
            <div class="list-item-tags">
                <span class="tag ${statusClass}">Status: ${b.status || "UNKNOWN"}</span>
                ${b.vehicle && b.vehicle.id ? `<span class="tag">Vehicle #${b.vehicle.id}</span>` : ""}
                ${b.customer && b.customer.email ? `<span class="tag">User: ${b.customer.email}</span>` : ""}
            </div>
        `;
        container.appendChild(div);
    });
}

function renderVehicles(list) {
    const container = document.getElementById("helper-vehicles-list");
    if (!container) return;

    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-muted small">No vehicles yet. Add one below.</p>`;
        return;
    }

    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>License plate</th>
                    <th>Capacity (kg)</th>
                    <th>City</th>
                    <th>Active</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
    `;

    list.forEach((v, index) => {
        const activeLabel = v.active ? "Active" : "Inactive";
        const activeClass = v.active ? "tag-status-accepted" : "tag-status-canceled";

        html += `
            <tr>
                <td>${v.id ?? (index + 1)}</td>
                <td>${v.type || "-"}</td>
                <td>${v.licensePlate || "-"}</td>
                <td>${v.capacityKg ?? "-"}</td>
                <td>${v.city || "-"}</td>
                <td><span class="tag ${activeClass}">${activeLabel}</span></td>
                <td>${v.description || ""}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// ======================
// MAIN INIT
// ======================
window.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ Helper dashboard loaded");

    const token = localStorage.getItem("jwt");

    if (!token) {
        console.warn("No JWT token found – redirecting to login");
        window.location.href = "login.html";
        return;
    }

    try {
        // 1) Check user
        const me = await apiGetCurrentUser(token);
        console.log("Current user:", me);

        const role = (me.role || "").toUpperCase();
        if (role !== "HELPER") {
            if (role === "USER") {
                window.location.href = "user-dashboard.html";
            } else if (role === "ADMIN") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "login.html";
            }
            return;
        }

        // Update auth UI
        const authStatusText = document.getElementById("auth-status-text");
        const authBadge = document.getElementById("auth-badge");
        const authEmail = document.getElementById("auth-email");

        if (authStatusText) authStatusText.textContent = "Logged in as HELPER";
        if (authBadge) {
            authBadge.classList.remove("auth-badge--logged-out");
            authBadge.classList.add("auth-badge--logged-in");
        }
        if (authEmail) authEmail.textContent = me.email || "";

        // 2) Load bookings
        try {
            const bookings = await apiGetHelperBookings(token);
            renderBookings(bookings);
        } catch (err) {
            console.error("Error loading bookings:", err);
            showToast("Error", "Could not load bookings.", "error");
        }

        // 3) Load vehicles
        try {
            const vehicles = await apiGetHelperVehicles(token);
            renderVehicles(vehicles);
        } catch (err) {
            console.error("Error loading vehicles:", err);
            showToast("Error", "Could not load vehicles.", "error");
        }

        // 4) Refresh buttons
        const btnRefreshBookings = document.getElementById("btn-refresh-helper-bookings");
        if (btnRefreshBookings) {
            btnRefreshBookings.addEventListener("click", async () => {
                try {
                    const b = await apiGetHelperBookings(token);
                    renderBookings(b);
                } catch (err) {
                    console.error(err);
                    showToast("Error", "Could not load bookings.", "error");
                }
            });
        }

        const btnRefreshVehicles = document.getElementById("btn-refresh-helper-vehicles");
        if (btnRefreshVehicles) {
            btnRefreshVehicles.addEventListener("click", async () => {
                try {
                    const v = await apiGetHelperVehicles(token);
                    renderVehicles(v);
                } catch (err) {
                    console.error(err);
                    showToast("Error", "Could not load vehicles.", "error");
                }
            });
        }

        // 5) Vehicle form submit
        const vehicleForm = document.getElementById("vehicle-form");
        if (vehicleForm) {
            vehicleForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                console.log("🚗 Vehicle form submitted");

                const active = document.getElementById("vehicle-active").checked;
                const capacityStr = document.getElementById("vehicle-capacity").value;
                const capacityKg = capacityStr ? parseInt(capacityStr, 10) : null;
                const city = document.getElementById("vehicle-city").value.trim();
                const description = document.getElementById("vehicle-description").value.trim();
                const licensePlate = document.getElementById("vehicle-license-plate").value.trim();
                const type = document.getElementById("vehicle-type").value;

                if (!capacityKg || !city || !description || !licensePlate || !type) {
                    showToast("Validation", "Please fill in all vehicle fields.", "error");
                    return;
                }

                const payload = {
                    type,
                    description,
                    capacityKg,
                    city,
                    licensePlate,
                    active
                };

                try {
                    await apiCreateHelperVehicle(token, payload);
                    showToast("Success", "Vehicle successfully added.", "success");

                    // reset form
                    vehicleForm.reset();
                    document.getElementById("vehicle-active").checked = true;

                    // reload vehicles
                    const v = await apiGetHelperVehicles(token);
                    renderVehicles(v);
                } catch (err) {
                    console.error("Error saving vehicle:", err);
                    showToast("Error", "Could not save vehicle.", "error");
                }
            });
        }

        // 6) Logout
        const btnLogout = document.getElementById("btn-logout");
        if (btnLogout) {
            btnLogout.addEventListener("click", () => {
                localStorage.removeItem("jwt");
                window.location.href = "login.html";
            });
        }
    } catch (err) {
        console.error("Fatal error in init:", err);
        localStorage.removeItem("jwt");
        window.location.href = "login.html";
    }
});
