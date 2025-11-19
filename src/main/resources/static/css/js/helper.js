const API_BASE = 'http://localhost:8080';
const token = localStorage.getItem('jwt');
if (!token) window.location.href = 'index.html';

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('jwt');
    window.location.href = 'index.html';
});

document.getElementById('addVehicleBtn').addEventListener('click', async () => {
    const type = document.getElementById('type').value.trim();
    const description = document.getElementById('description').value.trim();
    const capacity = document.getElementById('capacity').value.trim();
    const city = document.getElementById('city').value.trim();
    const license = document.getElementById('license').value.trim();

    const resp = await fetch(`${API_BASE}/api/helper/vehicles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            type,
            description,
            capacityKg: capacity ? Number(capacity) : null,
            city,
            licensePlate: license
        })
    });

    if (resp.ok) {
        alert('Vehicle added!');
        loadVehicles();
    } else {
        alert('Failed to add vehicle');
    }
});

async function loadVehicles() {
    const resp = await fetch(`${API_BASE}/api/helper/vehicles`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const vehicles = await resp.json();
    const container = document.getElementById('vehiclesList');
    container.innerHTML = '';
    vehicles.forEach(v => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
      <strong>${v.type}</strong> (${v.city})<br>
      ${v.description}<br>
      Capacity: ${v.capacityKg || 'N/A'} kg<br>
      Active: ${v.active}
    `;
        container.appendChild(div);
    });
}

async function loadBookings() {
    const resp = await fetch(`${API_BASE}/api/helper/bookings`, {
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
      From: ${b.fromAddress}<br>
      To: ${b.toAddress}<br>
      When: ${b.moveDate}<br>
      Status: ${b.status}
    `;
        container.appendChild(div);
    });
}

loadVehicles();
loadBookings();
