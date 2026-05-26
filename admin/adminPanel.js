// adminPanel.js — Full admin dashboard logic

const AUTH_API = '../backend/admin_auth.php';
const DATA_API = '../backend/admin_api.php';

// ── Auth guard ────────────────────────────────────────────────────────────
(async () => {
    try {
        const res  = await fetch(`${AUTH_API}?action=me`);
        const data = await res.json();
        if (!data.loggedIn) {
            window.location.replace('adminLogin.html');
        } else {
            document.getElementById('adminEmailLabel').textContent = data.email;
        }
    } catch (_) {
        window.location.replace('adminLogin.html');
    }
})();

// ════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════

function showToast(msg, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show' + (type ? ` ${type}` : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.className = 'toast'; }, 3200);
}

function fmtDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTime(timeStr) {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2,'0')} ${ampm}`;
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Generic API call helpers
async function apiGet(action) {
    const res = await fetch(`${DATA_API}?action=${action}`);
    return res.json();
}
async function apiPost(action, body) {
    const res = await fetch(`${DATA_API}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return res.json();
}
async function apiDelete(action, id) {
    const res = await fetch(`${DATA_API}?action=${action}&id=${id}`, { method: 'DELETE' });
    return res.json();
}

// ════════════════════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ════════════════════════════════════════════════════════════════════════════

let _confirmResolve = null;

function confirm(title, message) {
    return new Promise((resolve) => {
        _confirmResolve = resolve;
        document.getElementById('modalTitle').textContent   = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'flex';
    });
}

document.getElementById('modalCancel').addEventListener('click', () => {
    document.getElementById('confirmModal').style.display = 'none';
    if (_confirmResolve) _confirmResolve(false);
});
document.getElementById('modalConfirm').addEventListener('click', () => {
    document.getElementById('confirmModal').style.display = 'none';
    if (_confirmResolve) _confirmResolve(true);
});
document.getElementById('confirmModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('confirmModal')) {
        document.getElementById('confirmModal').style.display = 'none';
        if (_confirmResolve) _confirmResolve(false);
    }
});

// ════════════════════════════════════════════════════════════════════════════
// TAB NAVIGATION
// ════════════════════════════════════════════════════════════════════════════

const navItems = document.querySelectorAll('.nav-item');
const tabPanels = document.querySelectorAll('.tab-panel');

navItems.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        navItems.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${tab}`).classList.add('active');
        closeSidebar();

        // Lazy-load data on tab switch
        if (tab === 'overview')      loadStats();
        if (tab === 'appointments')  loadAppointments();
        if (tab === 'users')         loadUsers();
        if (tab === 'holidays')      loadHolidays();
        if (tab === 'services')      loadServices();
    });
});

// ════════════════════════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════════════════════════

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch(`${AUTH_API}?action=logout`);
    window.location.replace('adminLogin.html');
});

// ════════════════════════════════════════════════════════════════════════════
// MOBILE SIDEBAR
// ════════════════════════════════════════════════════════════════════════════

const sidebar         = document.getElementById('sidebar');
const sidebarOverlay  = document.getElementById('sidebarOverlay');

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
}

document.getElementById('hamburger').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
});
sidebarOverlay.addEventListener('click', closeSidebar);

// ════════════════════════════════════════════════════════════════════════════
// OVERVIEW — STATS
// ════════════════════════════════════════════════════════════════════════════

async function loadStats() {
    try {
        const data = await apiGet('stats');
        if (!data.success) return;
        document.getElementById('stat-appts').textContent    = data.total_appointments;
        document.getElementById('stat-pending').textContent  = data.pending_appointments;
        document.getElementById('stat-users').textContent    = data.total_users;
        document.getElementById('stat-holidays').textContent = data.upcoming_holidays;
        document.getElementById('stat-services').textContent = data.total_services;

        // Update pending badge
        const badge = document.getElementById('pendingBadge');
        if (data.pending_appointments > 0) {
            badge.textContent = data.pending_appointments;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    } catch (err) {
        console.error('Stats load error:', err);
    }
}

// ════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// ════════════════════════════════════════════════════════════════════════════

let allAppointments = [];

async function loadAppointments() {
    const tbody = document.getElementById('apptBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading-row">Loading…</td></tr>';
    try {
        const data = await apiGet('appointments');
        if (!data.success) throw new Error(data.message);
        allAppointments = data.data;
        renderAppointments(allAppointments);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="loading-row" style="color:var(--danger)">Failed to load: ${escapeHtml(err.message)}</td></tr>`;
    }
}

function renderAppointments(list) {
    const tbody = document.getElementById('apptBody');
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No appointments found.</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(a => `
        <tr>
            <td>
                <div class="patient-name">${escapeHtml(a.first_name)} ${escapeHtml(a.last_name)}</div>
                <div class="patient-sub">${escapeHtml(a.email)}</div>
            </td>
            <td>${escapeHtml(a.service_name || '—')}</td>
            <td>
                <div>${fmtDate(a.booking_date)}</div>
                <div class="patient-sub">${fmtTime(a.booking_time)}</div>
            </td>
            <td>${escapeHtml(a.phone || '—')}</td>
            <td><span class="type-badge type-${a.patient_type === 'new' ? 'new' : 'existing'}">${escapeHtml(a.patient_type || '—')}</span></td>
            <td><span class="status-badge status-${escapeHtml(a.status)}">${escapeHtml(a.status)}</span></td>
            <td style="display:flex;gap:6px;align-items:center;">
                ${a.status !== 'completed' ? `
                <button class="action-btn btn-complete" onclick="completeAppointment(${a.id})" title="Mark as completed">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </button>` : ''}
                <button class="action-btn btn-delete" onclick="deleteAppointment(${a.id}, '${escapeHtml(a.first_name)} ${escapeHtml(a.last_name)}')" title="Delete appointment">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </td>
        </tr>
    `).join('');
}

async function completeAppointment(id) {
    const ok = await confirm('Mark as Completed', 'Mark this appointment as completed?');
    if (!ok) return;
    try {
        const res  = await fetch(`${DATA_API}?action=complete_appointment&id=${id}`, { method: 'POST' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        const appt = allAppointments.find(a => a.id === id);
        if (appt) appt.status = 'completed';
        renderAppointments(filteredBy(allAppointments, document.getElementById('apptSearch').value));
        loadStats();
        showToast('Appointment marked as completed.', 'success');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

async function deleteAppointment(id, name) {
    const ok = await confirm('Delete Appointment', `Remove the appointment for ${name}? Their booked time slot will also be freed.`);
    if (!ok) return;
    try {
        const data = await apiDelete('appointment', id);
        if (!data.success) throw new Error(data.message);
        allAppointments = allAppointments.filter(a => a.id !== id);
        renderAppointments(filteredBy(allAppointments, document.getElementById('apptSearch').value));
        loadStats();
        showToast('Appointment removed.', 'success');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

// Search filter
document.getElementById('apptSearch').addEventListener('input', function() {
    renderAppointments(filteredBy(allAppointments, this.value));
});

// ════════════════════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════════════════════

let allUsers = [];

async function loadUsers() {
    const tbody = document.getElementById('userBody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading-row">Loading…</td></tr>';
    try {
        const data = await apiGet('users');
        if (!data.success) throw new Error(data.message);
        allUsers = data.data;
        renderUsers(allUsers);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="loading-row" style="color:var(--danger)">Failed to load: ${escapeHtml(err.message)}</td></tr>`;
    }
}

function renderUsers(list) {
    const tbody = document.getElementById('userBody');
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-row">No registered patients found.</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(u => `
        <tr>
            <td>
                <div class="patient-name">${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)}</div>
            </td>
            <td>${escapeHtml(u.email)}</td>
            <td>${escapeHtml(u.phone || '—')}</td>
            <td>${fmtDate(u.created_at?.split(' ')[0])}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteUser(${u.id}, '${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)}')" title="Delete user">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </td>
        </tr>
    `).join('');
}

async function deleteUser(id, name) {
    const ok = await confirm('Delete Patient', `Remove the account for ${name}? All their appointments will also be deleted. This cannot be undone.`);
    if (!ok) return;
    try {
        const data = await apiDelete('user', id);
        if (!data.success) throw new Error(data.message);
        allUsers = allUsers.filter(u => u.id !== id);
        renderUsers(filteredBy(allUsers, document.getElementById('userSearch').value));
        loadStats();
        showToast('Patient account deleted.', 'success');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

document.getElementById('userSearch').addEventListener('input', function() {
    renderUsers(filteredBy(allUsers, this.value));
});

// ════════════════════════════════════════════════════════════════════════════
// HOLIDAYS
// ════════════════════════════════════════════════════════════════════════════

let allHolidays = [];

async function loadHolidays() {
    const tbody = document.getElementById('holidayBody');
    tbody.innerHTML = '<tr><td colspan="3" class="loading-row">Loading…</td></tr>';
    try {
        const data = await apiGet('holidays');
        if (!data.success) throw new Error(data.message);
        allHolidays = data.data;
        renderHolidays(allHolidays);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="3" class="loading-row" style="color:var(--danger)">Failed to load: ${escapeHtml(err.message)}</td></tr>`;
    }
}

function renderHolidays(list) {
    const tbody = document.getElementById('holidayBody');
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-row">No holidays added yet.</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(h => `
        <tr>
            <td><strong>${fmtDate(h.holiday_date)}</strong></td>
            <td>${escapeHtml(h.label || '—')}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteHoliday(${h.id}, '${fmtDate(h.holiday_date)}')" title="Remove holiday">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('addHolidayBtn').addEventListener('click', async () => {
    const date    = document.getElementById('holidayDate').value;
    const label   = document.getElementById('holidayLabel').value.trim();
    const feedback = document.getElementById('holidayFeedback');

    feedback.className = 'form-feedback';
    feedback.textContent = '';

    if (!date) {
        feedback.className = 'form-feedback error';
        feedback.textContent = 'Please select a date.';
        return;
    }

    const btn = document.getElementById('addHolidayBtn');
    btn.disabled = true;
    try {
        const data = await apiPost('holiday', { date, label });
        if (!data.success) throw new Error(data.message);
        feedback.className = 'form-feedback success';
        feedback.textContent = `Holiday on ${fmtDate(date)} added successfully.`;
        document.getElementById('holidayDate').value  = '';
        document.getElementById('holidayLabel').value = '';
        await loadHolidays();
        loadStats();
    } catch (err) {
        feedback.className = 'form-feedback error';
        feedback.textContent = 'Error: ' + err.message;
    } finally {
        btn.disabled = false;
    }
});

async function deleteHoliday(id, dateStr) {
    const ok = await confirm('Remove Holiday', `Remove the holiday on ${dateStr}? Patients will be able to book on this date again.`);
    if (!ok) return;
    try {
        const data = await apiDelete('holiday', id);
        if (!data.success) throw new Error(data.message);
        await loadHolidays();
        loadStats();
        showToast('Holiday removed.', 'success');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICES
// ════════════════════════════════════════════════════════════════════════════

let allServices = [];

async function loadServices() {
    const tbody = document.getElementById('serviceBody');
    tbody.innerHTML = '<tr><td colspan="4" class="loading-row">Loading…</td></tr>';
    try {
        const data = await apiGet('services');
        if (!data.success) throw new Error(data.message);
        allServices = data.data;
        renderServices(allServices);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" class="loading-row" style="color:var(--danger)">Failed to load: ${escapeHtml(err.message)}</td></tr>`;
    }
}

function renderServices(list) {
    const tbody = document.getElementById('serviceBody');
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-row">No services added yet.</td></tr>';
        return;
    }
    tbody.innerHTML = list.map((s, i) => `
        <tr>
            <td style="color:var(--muted);font-weight:600;">${i + 1}</td>
            <td><strong>${escapeHtml(s.name)}</strong></td>
            <td>${s.duration_hours} hr${s.duration_hours !== 1 ? 's' : ''}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteService(${s.id}, '${escapeHtml(s.name)}')" title="Remove service">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('addServiceBtn').addEventListener('click', async () => {
    const name     = document.getElementById('serviceName').value.trim();
    const duration = parseFloat(document.getElementById('serviceDuration').value);
    const feedback = document.getElementById('serviceFeedback');

    feedback.className = 'form-feedback';
    feedback.textContent = '';

    if (!name) {
        feedback.className = 'form-feedback error';
        feedback.textContent = 'Please enter a service name.';
        return;
    }
    if (!duration || duration <= 0) {
        feedback.className = 'form-feedback error';
        feedback.textContent = 'Please enter a valid duration (e.g. 1, 1.5, 2).';
        return;
    }

    const btn = document.getElementById('addServiceBtn');
    btn.disabled = true;
    try {
        const data = await apiPost('service', { name, duration_hours: duration });
        if (!data.success) throw new Error(data.message);
        feedback.className = 'form-feedback success';
        feedback.textContent = `"${name}" added successfully.`;
        document.getElementById('serviceName').value     = '';
        document.getElementById('serviceDuration').value = '';
        await loadServices();
        loadStats();
    } catch (err) {
        feedback.className = 'form-feedback error';
        feedback.textContent = 'Error: ' + err.message;
    } finally {
        btn.disabled = false;
    }
});

async function deleteService(id, name) {
    const ok = await confirm('Remove Service', `Remove "${name}" from the service list? Existing appointments with this service will still remain.`);
    if (!ok) return;
    try {
        const data = await apiDelete('service', id);
        if (!data.success) throw new Error(data.message);
        await loadServices();
        loadStats();
        showToast(`"${name}" removed.`, 'success');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ════════════════════════════════════════════════════════════════════════════

function filteredBy(list, query) {
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(item =>
        Object.values(item).some(v => String(v ?? '').toLowerCase().includes(q))
    );
}

// ── Init: load overview on first visit ────────────────────────────────────
loadStats();