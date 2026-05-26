// adminLogin.js — Handles admin login form logic

const API = '../backend/admin_auth.php';

// ── Check if already logged in ────────────────────────────────────────────
(async () => {
    try {
        const res  = await fetch(`${API}?action=me`);
        const data = await res.json();
        if (data.loggedIn) {
            window.location.replace('adminPanel.html');
        }
    } catch (_) { /* offline/dev — ignore */ }
})();

// ── DOM refs ─────────────────────────────────────────────────────────────
const emailInput    = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn      = document.getElementById('loginBtn');
const errorMsg      = document.getElementById('errorMsg');
const togglePw      = document.getElementById('togglePw');
const btnText       = loginBtn.querySelector('.btn-text');
const btnLoader     = loginBtn.querySelector('.btn-loader');

// ── Password visibility toggle ────────────────────────────────────────────
togglePw.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePw.querySelector('svg').style.color = isPassword ? 'var(--bondi-blue)' : '';
});

// ── Show / hide error ─────────────────────────────────────────────────────
function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
}
function hideError() {
    errorMsg.style.display = 'none';
}

// ── Set loading state ─────────────────────────────────────────────────────
function setLoading(loading) {
    loginBtn.disabled = loading;
    btnText.style.display   = loading ? 'none' : 'inline';
    btnLoader.style.display = loading ? 'flex' : 'none';
}

// ── Login submit ──────────────────────────────────────────────────────────
async function doLogin() {
    hideError();
    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showError('Please enter your username and password.');
        return;
    }

    setLoading(true);
    try {
        const res  = await fetch(`${API}?action=login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (data.success) {
            window.location.replace('adminPanel.html');
        } else {
            showError(data.message || 'Login failed. Please try again.');
        }
    } catch (err) {
        showError('Network error. Please check your connection.');
    } finally {
        setLoading(false);
    }
}

loginBtn.addEventListener('click', doLogin);

// Allow Enter key to submit
[emailInput, passwordInput].forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});
