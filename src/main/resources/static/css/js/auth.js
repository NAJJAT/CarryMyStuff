const API_BASE = 'http://localhost:8080';

document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorEl = document.getElementById('error');

    errorEl.textContent = '';

    try {
        const resp = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });

        if (!resp.ok) {
            errorEl.textContent = 'Login failed';
            return;
        }

        const data = await resp.json();   // { token: "..." }
        localStorage.setItem('jwt', data.token);

        const meResp = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { 'Authorization': 'Bearer ' + data.token }
        });

        if (!meResp.ok) {
            errorEl.textContent = 'Could not load user info';
            return;
        }

        const me = await meResp.json(); // { role: "USER" / "HELPER" / "ADMIN" }

        if (me.role === 'USER') {
            window.location.href = 'user-dashboard.html';
        } else if (me.role === 'HELPER') {
            window.location.href = 'helper-dashboard.html';
        } else if (me.role === 'ADMIN') {
            window.location.href = 'admin-dashboard.html';
        } else {
            errorEl.textContent = 'Unknown role';
        }

    } catch (e) {
        console.error(e);
        errorEl.textContent = 'Network error';
    }
});
