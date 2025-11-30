const API_BASE_URL = "http://localhost:8081"; // adjust if needed

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

function formatDateTime(dt) {
    if (!dt) return "";
    try {
        return new Date(dt).toLocaleString();
    } catch {
        return dt;
    }
}

function formatStatusOptions(current) {
    const statuses = ["PENDING", "ACCEPTED", "DONE", "CANCELED"];
    return statuses.map(s => {
        const selected = s === (current || "").toUpperCase() ? "selected" : "";
        return `<option value="${s}" ${selected}>${s}</option>`;
    }).join("");
}

async function apiMe(token) {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch current user");
    return await res.json();
}

// --- BOOKINGS ---
async function apiGetAllBookings(token) {
    const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load bookings");
    return await res.json();
}

async function apiUpdateBookingStatus(token, bookingId, status) {
    const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update booking status");
    }
    return await res.json();
}

// --- VEHICLES ---
async function apiGetAllVehicles(token) {
    const res = await fetch(`${API_BASE_URL}/api/admin/vehicles`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load vehicles");
    return await res.json();
}

async function apiUpdateVehicleActive(token, vehicleId, active) {
    const res = await fetch(`${API_BASE_URL}/api/admin/vehicles/${vehicleId}/active`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ active })
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update vehicle");
    }
    return await res.json();
}

// --- USERS ---
async function apiGetAllUsers(token) {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load users");
    return await res.json();
}

async function apiUpdateUserRole(token, userId, role) {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ role })
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update user role");
    }
    return await res.json();
}

// --- RENDERING ---

function renderBookings(list) {
    const tbody = document.querySelector("#table-bookings tbody");
    tbody.innerHTML = "";
    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-muted small">No bookings found.</td></tr>`;
        return;
    }

    list.forEach(b => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${b.id}</td>
            <td>${b.customer && b.customer.email ? b.customer.email : "-"}</td>
            <td>${b.helper && b.helper.email ? b.helper.email : "-"}</td>
            <td>${b.vehicle && b.vehicle.id ? "#" + b.vehicle.id : "-"}</td>
            <td>${formatDateTime(b.moveDate)}</td>
            <td>
                <select class="booking-status-select" data-id="${b.id}">
                    ${formatStatusOptions(b.status)}
                </select>
            </td>
            <td>
                <button class="btn btn-secondary btn-small btn-save-booking" data-id="${b.id}">
                    Save
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderVehicles(list) {
    const tbody = document.querySelector("#table-vehicles tbody");
    tbody.innerHTML = "";
    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-muted small">No vehicles found.</td></tr>`;
        return;
    }

    list.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${v.id}</td>
            <td>${v.helper && v.helper.email ? v.helper.email : "-"}</td>
            <td>${v.type || ""}</td>
            <td>${v.city || ""}</td>
            <td>${v.capacityKg != null ? v.capacityKg + " kg" : "-"}</td>
            <td>${v.licensePlate || ""}</td>
            <td>
                <input type="checkbox" class="vehicle-active-checkbox" data-id="${v.id}"
                    ${v.active ? "checked" : ""}>
            </td>
            <td>
                <button class="btn btn-secondary btn-small btn-save-vehicle" data-id="${v.id}">
                    Save
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderUsers(list) {
    const tbody = document.querySelector("#table-users tbody");
    tbody.innerHTML = "";
    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-muted small">No users found.</td></tr>`;
        return;
    }

    list.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name || ""}</td>
            <td>${u.email || ""}</td>
            <td>${u.city || ""}</td>
            <td>${u.phoneNumber || ""}</td>
            <td>
                <select class="user-role-select" data-id="${u.id}">
                    <option value="USER" ${u.role === "USER" ? "selected" : ""}>USER</option>
                    <option value="HELPER" ${u.role === "HELPER" ? "selected" : ""}>HELPER</option>
                    <option value="ADMIN" ${u.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
                </select>
            </td>
            <td>
                <button class="btn btn-secondary btn-small btn-save-user" data-id="${u.id}">
                    Save
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- MAIN INIT ---

window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwt");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const me = await apiMe(token);
        if ((me.role || "").toUpperCase() !== "ADMIN") {
            // redirect to proper dashboard if not admin
            const r = (me.role || "").toUpperCase();
            if (r === "USER") {
                window.location.href = "user-dashboard.html";
            } else if (r === "HELPER") {
                window.location.href = "helper-dashboard.html";
            } else {
                window.location.href = "login.html";
            }
            return;
        }

        // header status
        document.getElementById("auth-status-text").textContent = "Logged in as ADMIN";
        const badge = document.getElementById("auth-badge");
        badge.classList.remove("auth-badge--logged-out");
        badge.classList.add("auth-badge--logged-in");
        document.getElementById("auth-email").textContent = me.email;

        // initial loads
        const [bookings, vehicles, users] = await Promise.all([
            apiGetAllBookings(token),
            apiGetAllVehicles(token),
            apiGetAllUsers(token)
        ]);
        renderBookings(bookings);
        renderVehicles(vehicles);
        renderUsers(users);

        // REFRESH buttons
        document.getElementById("btn-refresh-admin-bookings").addEventListener("click", async () => {
            try {
                const data = await apiGetAllBookings(token);
                renderBookings(data);
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not reload bookings.", "error");
            }
        });

        document.getElementById("btn-refresh-admin-vehicles").addEventListener("click", async () => {
            try {
                const data = await apiGetAllVehicles(token);
                renderVehicles(data);
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not reload vehicles.", "error");
            }
        });

        document.getElementById("btn-refresh-admin-users").addEventListener("click", async () => {
            try {
                const data = await apiGetAllUsers(token);
                renderUsers(data);
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not reload users.", "error");
            }
        });

        // SAVE actions – event delegation

        // bookings
        document.querySelector("#table-bookings tbody").addEventListener("click", async (e) => {
            if (!e.target.classList.contains("btn-save-booking")) return;
            const id = e.target.dataset.id;
            const select = document.querySelector(`.booking-status-select[data-id="${id}"]`);
            const status = select.value;
            try {
                await apiUpdateBookingStatus(token, id, status);
                showToast("Updated", `Booking #${id} status updated to ${status}.`, "success");
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not update booking status.", "error");
            }
        });

        // vehicles
        document.querySelector("#table-vehicles tbody").addEventListener("click", async (e) => {
            if (!e.target.classList.contains("btn-save-vehicle")) return;
            const id = e.target.dataset.id;
            const checkbox = document.querySelector(`.vehicle-active-checkbox[data-id="${id}"]`);
            const active = checkbox.checked;
            try {
                await apiUpdateVehicleActive(token, id, active);
                showToast("Updated", `Vehicle #${id} active=${active}.`, "success");
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not update vehicle.", "error");
            }
        });

        // users
        document.querySelector("#table-users tbody").addEventListener("click", async (e) => {
            if (!e.target.classList.contains("btn-save-user")) return;
            const id = e.target.dataset.id;
            const select = document.querySelector(`.user-role-select[data-id="${id}"]`);
            const role = select.value;
            try {
                await apiUpdateUserRole(token, id, role);
                showToast("Updated", `User #${id} role set to ${role}.`, "success");
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not update user role.", "error");
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
