const API_BASE = 'http://localhost:8080';
const token = localStorage.getItem('jwt');

if (!token) {
    window.location.href = 'index.html';
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('jwt');
    window.location.href = 'index.html';
});

document.getElementById('searchBtn').addEventListener('click', async () => {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return;

    const resp = await fetch(`${API_BASE}/api/user/vehicles?city=${encodeURIComponent(city)}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const vehicles = await resp.json();
    const container = document.getElementById('vehiclesList');
    container.innerHTML = '';

    vehicles.forEach(v => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
      <strong>${v.type}</strong> - ${v.description}<br>
      Capacity: ${v.capacityKg || 'N/A'} kg - City: ${v.city}<br>
      Helper: ${v.helper ? v.helper.name : ''}<br>
      <button data-id="${v.id}" class="book-btn">Book</button>
    `;
        container.appendChild(div);
    });

    container.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', () => showBookingForm(btn.dataset.id));
    });
});

function showBookingForm(vehicleId) {
    const from = prompt('From address:');
    const to = prompt('To address:');
    const dateStr = prompt('Move date and time (YYYY-MM-DDTHH:MM), e.g. 2025-12-01T10:00');

    if (!from || !to || !dateStr) return;

    fetch(`${API_BASE}/api/user/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            vehicleId: Number(vehicleId),
            fromAddress: from,
            toAddress: to,
            moveDate: dateStr
        })
    }).then(r => {
        if (r.ok) {
            alert('Booking created!');
            loadBookings();
        } else {
            alert('Failed to create booking');
        }
    });
}

async function loadBookings() {
    const resp = await fetch(`${API_BASE}/api/user/bookings`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const bookings = await resp.json();
    const container = document.getElementById('bookingsList');
    container.innerHTML = '';

    bookings.forEach(b => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
      <strong>${b.vehicle ? b.vehicle.type : ''}</strong><br>
      From: ${b.fromAddress}<br>
      To: ${b.toAddress}<br>
      When: ${b.moveDate}<br>
      Status: ${b.status}
    `;
        container.appendChild(div);
    });
}

loadBookings();
