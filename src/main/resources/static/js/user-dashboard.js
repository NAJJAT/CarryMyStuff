const API_BASE_URL = "http://localhost:8081";

let allVehicles = [];   // all active vehicles from backend
let vehiclesCache = []; // currently displayed list
let selectedVehicleId = null;

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

// Optional debug panel (uses your #debug-info and #debug-content divs)
function updateDebugInfo(cityInput, typeInput, filtered) {
    const box = document.getElementById("debug-info");
    const content = document.getElementById("debug-content");
    if (!box || !content) return;

    const uniqueCities = [...new Set(
        allVehicles
            .map(v => (v.city || "").trim())
            .filter(c => c !== "")
    )];

    const uniqueTypes = [...new Set(
        allVehicles
            .map(v => (v.type || "").trim())
            .filter(t => t !== "")
    )];

    box.style.display = "block";
    content.innerText =
        `Filter city: "${cityInput}"\n` +
        `Filter type: "${typeInput}"\n` +
        `Total vehicles loaded: ${allVehicles.length}\n` +
        `Vehicles after filter: ${filtered.length}\n\n` +
        `Available cities: ${uniqueCities.join(", ") || "(none)"}\n` +
        `Available types: ${uniqueTypes.join(", ") || "(none)"}`;
}

async function apiMe(token) {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch current user");
    return await res.json();
}

// --- VEHICLES ---

// get all active vehicles (no filter, used as base)
async function apiGetActiveVehicles(token) {
    const res = await fetch(`${API_BASE_URL}/api/user/vehicles/all`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
        const txt = await res.text();
        console.error("Error loading vehicles:", res.status, txt);
        throw new Error("Failed to load vehicles");
    }

    const data = await res.json();
    console.log("Loaded active vehicles:", data.length);
    return data;
}

// --- BOOKINGS ---

async function apiCreateBooking(token, payload) {
    const res = await fetch(`${API_BASE_URL}/api/user/bookings`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to create booking");
    }
    return await res.json();
}

async function apiGetMyBookings(token) {
    const res = await fetch(`${API_BASE_URL}/api/user/bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load bookings");
    return await res.json();
}

function formatDateTime(dt) {
    if (!dt) return "";
    try {
        return new Date(dt).toLocaleString();
    } catch {
        return dt;
    }
}

// --- RENDER VEHICLES AS CARDS ---

function renderVehicles(list) {
    vehiclesCache = list || [];
    const container = document.getElementById("vehicles-list");
    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-muted small">No vehicles found.</p>`;
        return;
    }

    list.forEach(v => {
        const card = document.createElement("div");
        card.className = "vehicle-card";

        card.innerHTML = `
            <div class="vehicle-card-header">
                <div class="vehicle-type">
                    ${v.type || "Vehicle"}
                    <span class="vehicle-city">· ${v.city || ""}</span>
                </div>
                <div class="vehicle-id">#${v.id}</div>
            </div>
            <div class="vehicle-card-body">
                <div class="vehicle-line">
                    <span class="label">Capacity:</span>
                    <span>${v.capacityKg != null ? v.capacityKg + " kg" : "-"}</span>
                </div>
                <div class="vehicle-line">
                    <span class="label">Plate:</span>
                    <span>${v.licensePlate || "-"}</span>
                </div>
                <div class="vehicle-line">
                    <span class="label">Helper:</span>
                    <span>${v.helper && v.helper.email ? v.helper.email : "-"}</span>
                </div>
                <div class="vehicle-description">
                    ${v.description || ""}
                </div>
            </div>
            <div class="vehicle-card-footer">
                <button class="btn btn-primary btn-small btn-choose-vehicle" data-id="${v.id}">
                    Choose this vehicle
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

function selectVehicle(vehicleId) {
    selectedVehicleId = vehicleId;

    const vehicle = vehiclesCache.find(v => v.id === Number(vehicleId));
    const label = document.getElementById("selected-vehicle-label");
    const vehicleIdInput = document.getElementById("booking-vehicle-id");

    if (!vehicle) {
        label.textContent = "None selected";
        vehicleIdInput.value = "";
        return;
    }

    vehicleIdInput.value = vehicle.id;
    label.textContent = `#${vehicle.id} – ${vehicle.type || ""} (${vehicle.city || ""})`;

    document.querySelectorAll(".vehicle-card").forEach(card => {
        card.classList.remove("vehicle-card-selected");
    });
    const btn = document.querySelector(`.btn-choose-vehicle[data-id="${vehicle.id}"]`);
    if (btn) {
        const card = btn.closest(".vehicle-card");
        if (card) card.classList.add("vehicle-card-selected");
    }
}

// --- RENDER BOOKINGS ---

function renderBookings(list) {
    const container = document.getElementById("bookings-list");
    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = `<p class="text-muted small">You have no bookings yet.</p>`;
        return;
    }

    list.forEach(b => {
        const div = document.createElement("div");
        div.className = "list-item";

        div.innerHTML = `
            <div class="list-item-main">
                <div class="list-item-title">
                    Booking #${b.id} – ${b.status}
                </div>
                <div class="list-item-subtitle">
                    Vehicle: ${b.vehicle && b.vehicle.id ? "#" + b.vehicle.id : "-"}
                    · Helper: ${b.helper && b.helper.email ? b.helper.email : "-"}
                </div>
            </div>
            <div class="list-item-extra small">
                <div>From: ${b.fromAddress || "-"}</div>
                <div>To: ${b.toAddress || "-"}</div>
                <div>Date: ${formatDateTime(b.moveDate)}</div>
            </div>
        `;

        container.appendChild(div);
    });
}

// --- FRONTEND FILTERING (city + type on allVehicles) ---

function applyVehicleFilter() {
    const cityInput = document.getElementById("filter-city").value.trim();
    const typeInput = document.getElementById("filter-type").value;

    console.log("Filtering on frontend. City =", cityInput, "Type =", typeInput);

    let filtered = [...allVehicles];

    // filter by city (contains, case-insensitive)
    if (cityInput) {
        const c = cityInput.toLowerCase();
        filtered = filtered.filter(v =>
            v.city && v.city.toLowerCase().includes(c)
        );
    }

    // filter by type (exact match, case-insensitive)
    if (typeInput && typeInput !== "ANY") {
        const t = typeInput.toUpperCase();
        filtered = filtered.filter(v =>
            v.type && v.type.toUpperCase() === t
        );
    }

    console.log("Filtered vehicles count:", filtered.length);
    updateDebugInfo(cityInput, typeInput, filtered);
    renderVehicles(filtered);

    selectedVehicleId = null;
    document.getElementById("booking-vehicle-id").value = "";
    document.getElementById("selected-vehicle-label").textContent = "None selected";

    if (filtered.length === 0) {
        showToast("No vehicles", "No vehicles match your filters.", "error");
    } else {
        showToast("Search OK", `Found ${filtered.length} vehicles.`, "success");
    }
}

// --- MAIN INIT ---

window.addEventListener("DOMContentLoaded", async () => {
    console.log("User dashboard JS loaded");

    const token = localStorage.getItem("jwt");
    if (!token) {
        console.warn("No JWT, redirecting to login");
        window.location.href = "login.html";
        return;
    }

    try {
        const me = await apiMe(token);
        console.log("Current user:", me);
        const role = (me.role || "").toUpperCase();

        if (role !== "USER") {
            console.warn("Not USER, redirecting. Role =", role);
            if (role === "HELPER") {
                window.location.href = "helper-dashboard.html";
            } else if (role === "ADMIN") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "login.html";
            }
            return;
        }

        // header status
        document.getElementById("auth-status-text").textContent = "Logged in as USER";
        const badge = document.getElementById("auth-badge");
        badge.classList.remove("auth-badge--logged-out");
        badge.classList.add("auth-badge--logged-in");
        document.getElementById("auth-email").textContent = me.email;

        // initial load: all vehicles + my bookings
        const [vehicles, bookings] = await Promise.all([
            apiGetActiveVehicles(token),
            apiGetMyBookings(token)
        ]);

        allVehicles = vehicles;   // save base list
        renderVehicles(allVehicles);
        renderBookings(bookings);
        updateDebugInfo("", "ANY", allVehicles);

        // ---- FILTER BUTTON: SEARCH (frontend only) ----
        const btnSearch = document.getElementById("btn-search-vehicles");
        if (btnSearch) {
            btnSearch.addEventListener("click", (e) => {
                e.preventDefault();  // in case inside a form
                applyVehicleFilter();
            });
        } else {
            console.error("#btn-search-vehicles not found");
        }

        // ---- SHOW ALL BUTTON ----
        const btnShowAll = document.getElementById("btn-load-vehicles");
        if (btnShowAll) {
            btnShowAll.addEventListener("click", async (e) => {
                e.preventDefault();
                console.log("Show all button clicked");
                try {
                    const fresh = await apiGetActiveVehicles(token);
                    allVehicles = fresh;
                    renderVehicles(allVehicles);

                    document.getElementById("filter-city").value = "";
                    document.getElementById("filter-type").value = "ANY";
                    selectedVehicleId = null;
                    document.getElementById("booking-vehicle-id").value = "";
                    document.getElementById("selected-vehicle-label").textContent = "None selected";

                    updateDebugInfo("", "ANY", allVehicles);
                } catch (err) {
                    console.error(err);
                    showToast("Error", "Could not load vehicles.", "error");
                }
            });
        } else {
            console.error("#btn-load-vehicles not found");
        }

        // choose vehicle from card
        document.getElementById("vehicles-list").addEventListener("click", (e) => {
            if (e.target.classList.contains("btn-choose-vehicle")) {
                const id = e.target.getAttribute("data-id");
                console.log("Vehicle chosen:", id);
                selectVehicle(id);
            }
        });

        // create booking
        document.getElementById("btn-create-booking").addEventListener("click", async () => {
            const vehicleId = document.getElementById("booking-vehicle-id").value;
            const fromAddress = document.getElementById("booking-from").value.trim();
            const toAddress = document.getElementById("booking-to").value.trim();
            const moveDate = document.getElementById("booking-date").value;

            if (!vehicleId) {
                showToast("No vehicle", "Please choose a vehicle first.", "error");
                return;
            }
            if (!fromAddress || !toAddress || !moveDate) {
                showToast("Missing data", "Please fill from/to address and date.", "error");
                return;
            }

            const payload = {
                vehicleId: Number(vehicleId),
                fromAddress,
                toAddress,
                moveDate
            };

            try {
                const booking = await apiCreateBooking(token, payload);
                showToast("Booking created", `Booking #${booking.id} created.`, "success");
                const updated = await apiGetMyBookings(token);
                renderBookings(updated);
            } catch (err) {
                console.error(err);
                showToast("Error", err.message || "Could not create booking.", "error");
            }
        });

        // refresh bookings
        document.getElementById("btn-refresh-bookings").addEventListener("click", async () => {
            try {
                const data = await apiGetMyBookings(token);
                renderBookings(data);
                showToast("Bookings updated", "Your bookings have been refreshed.", "success");
            } catch (err) {
                console.error(err);
                showToast("Error", "Could not load bookings.", "error");
            }
        });

        // logout
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
