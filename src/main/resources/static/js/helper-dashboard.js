const API_BASE_URL = "http://localhost:8081";

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

async function apiGetCurrentUser(token) {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch current user");
    return await res.json();
}

async function apiGetHelperBookings(token) {
    const res = await fetch(`${API_BASE_URL}/api/helper/bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load helper bookings");
    return await res.json();
}

function renderBookings(list) {
    const container = document.getElementById("helper-bookings-list");
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

window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwt");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const me = await apiGetCurrentUser(token);
        if ((me.role || "").toUpperCase() !== "HELPER") {
            if (me.role.toUpperCase() === "USER") {
                window.location.href = "user-dashboard.html";
            } else if (me.role.toUpperCase() === "ADMIN") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "login.html";
            }
            return;
        }

        document.getElementById("auth-status-text").textContent = "Logged in as HELPER";
        document.getElementById("auth-badge").classList.remove("auth-badge--logged-out");
        document.getElementById("auth-badge").classList.add("auth-badge--logged-in");
        document.getElementById("auth-email").textContent = me.email;

        const bookings = await apiGetHelperBookings(token);
        renderBookings(bookings);

        document.getElementById("btn-refresh-helper-bookings").addEventListener("click", async () => {
            try {
                const b = await apiGetHelperBookings(token);
                renderBookings(b);
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not load bookings.", "error");
            }
        });

        document.getElementById("btn-logout").addEventListener("click", () => {
            localStorage.removeItem("jwt");
            window.location.href = "login.html";
        });
    } catch (err) {
        console.error(err);
        localStorage.removeItem("jwt");
        window.location.href = "login.html";
    }
});
