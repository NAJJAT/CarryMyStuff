const API_BASE = 'http://localhost:8081';
const token = localStorage.getItem('jwt');
if (!token) window.location.href = 'index.html';

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('jwt');
    window.location.href = 'index.html';
});

// USERS
async function loadUsers() {
    const resp = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const users = await resp.json();
    const container = document.getElementById('usersList');
    container.innerHTML = '';
    users.forEach(u => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
      <strong>${u.name}</strong> (${u.role})<br>
      ${u.email} - ${u.city || ''}<br>
      <button data-id="${u.id}" class="delete-user">Delete</button>
    `;
        container.appendChild(div);
    });

    container.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Delete user?')) return;
            await fetch(`${API_BASE}/api/admin/users/${btn.dataset.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            loadUsers();
        });
    });
}

// VEHICLES
async function loadVehicles() {
    const resp = await fetch(`${API_BASE}/api/admin/vehicles`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const vehicles = await resp.json();
    const container = document.getElementById('vehiclesList');
    container.innerHTML = '';
    vehicles.forEach(v => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
      <strong>${v.type}</strong> - ${v.city}<br>
      ${v.description}<br>
      Helper: ${v.helper ? v.helper.name : ''}<br>
      Active: ${v.active}<br>
      <button data-id="${v.id}" class="activate-vehicle">Toggle Active</button>
      <button data-id="${v.id}" class="delete-vehicle">Delete</button>
    `;
        container.appendChild(div);
    });

    container.querySelectorAll('.activate-vehicle').forEach(btn => {
        btn.addEventListener('click', async () => {
            await fetch(`${API_BASE}/api/admin/vehicles/${btn.dataset.id}/active?active=true`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            loadVehicles();
        });
    });

    container.querySelectorAll('.delete-vehicle').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Delete vehicle?')) return;
            await fetch(`${API_BASE}/api/admin/vehicles/${btn.dataset.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            loadVehicles();
        });
    });
}

// BOOKINGS
async function loadBookings() {
    const resp = await fetch(`${API_BASE}/api/admin/bookings`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const bookings = await resp.json();
    const container = document.getElementById('bookingsList');
    container.innerHTML = '';
    bookings.forEach(b => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
      Customer: ${b.customer ? b.customer.name : ''}<br>
      Helper: ${b.helper ? b.helper.name : ''}<br>
      Vehicle: ${b.vehicle ? b.vehicle.type : ''}<br>
      From: ${b.fromAddress}<br>
      To: ${b.toAddress}<br>
      When: ${b.moveDate}<br>
      Status: ${b.status}
    `;
        container.appendChild(div);
    });
}

loadUsers();
loadVehicles();
loadBookings();
