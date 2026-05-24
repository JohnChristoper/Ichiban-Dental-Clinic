// javascript/auth.js
// Manages: session check on load, login modal, signup modal, logout, header UI update
// Include this on EVERY page:  <script src="javascript/auth.js"></script>

(function () {
    'use strict';

    // ── CONFIG ───────────────────────────────────────────────────────────────
    const AUTH_URL = 'backend/auth.php';

    // ── STATE ────────────────────────────────────────────────────────────────
    let currentUser = null; // null = guest, object = logged in

    // ── INIT: check session on every page load ───────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        injectModal();
        checkSession();
    });

    function checkSession() {
        fetch(`${AUTH_URL}?action=me`)
            .then(r => r.json())
            .then(data => {
                if (data.loggedIn) {
                    currentUser = data;
                    applyLoggedInHeader(data);
                } else {
                    currentUser = null;
                    applyGuestHeader();
                }
            })
            .catch(() => applyGuestHeader());
    }

    // ── HEADER DOM UPDATES ──────────────────────────────────────────────────
    function applyGuestHeader() {
        const userInfo = document.querySelector('.overlay-user-info');
        const logoutLinks = document.querySelectorAll('.overlay-logout-action');
        const loginLinks = document.querySelectorAll('.overlay-login-action');

        if (userInfo) {
            const h3 = userInfo.querySelector('h3');
            const p  = userInfo.querySelector('p');
            if (h3) h3.textContent = 'Guest';
            if (p)  p.textContent  = 'Not signed in';
        }

        logoutLinks.forEach(el => { el.style.display = 'none'; });
        loginLinks.forEach(el  => { el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.gap = '12px'; });
    }

    function applyLoggedInHeader(user) {
        const userInfo = document.querySelector('.overlay-user-info');
        const logoutLinks = document.querySelectorAll('.overlay-logout-action');
        const loginLinks = document.querySelectorAll('.overlay-login-action');

        if (userInfo) {
            const h3 = userInfo.querySelector('h3');
            const p  = userInfo.querySelector('p');
            if (h3) h3.textContent = `${user.first_name} ${user.last_name}`;
            if (p)  p.textContent  = user.email;
        }

        logoutLinks.forEach(el => { el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.gap = '12px'; });
        loginLinks.forEach(el  => { el.style.display = 'none'; });
    }

    // ── MODAL INJECTION ─────────────────────────────────────────────────────
    function injectModal() {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.innerHTML = `
            <div class="auth-modal-backdrop" id="authBackdrop"></div>
            <div class="auth-modal-card" role="dialog" aria-modal="true">

                <button class="auth-close-btn" id="authCloseBtn" aria-label="Close">&times;</button>

                <div class="auth-tab-row">
                    <button class="auth-tab active" data-tab="login">Log In</button>
                    <button class="auth-tab" data-tab="signup">Create Account</button>
                </div>

                <div class="auth-panel" id="panelLogin">
                    <h2 class="auth-title">Log In</h2>
                    <p class="auth-subtitle">New? <a href="#" class="auth-switch-link" data-target="signup">Create an Account</a></p>

                    <div class="auth-error-msg" id="loginError"></div>

                    <div class="auth-field-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" placeholder="youremail@gmail.com" autocomplete="email">
                    </div>
                    <div class="auth-field-group">
                        <label>Password</label>
                        <input type="password" id="loginPassword" placeholder="your password" autocomplete="current-password">
                    </div>

                    <button class="auth-submit-btn" id="loginSubmitBtn">Log In</button>
                </div>

                <div class="auth-panel" id="panelSignup" style="display:none;">
                    <h2 class="auth-title">Create Account</h2>
                    <p class="auth-subtitle">Already have one? <a href="#" class="auth-switch-link" data-target="login">Log In</a></p>

                    <div class="auth-error-msg" id="signupError"></div>

                    <div class="auth-field-row-2">
                        <div class="auth-field-group">
                            <label>First Name</label>
                            <input type="text" id="signupFirst" placeholder="First name" autocomplete="given-name">
                        </div>
                        <div class="auth-field-group">
                            <label>Last Name</label>
                            <input type="text" id="signupLast" placeholder="Last name" autocomplete="family-name">
                        </div>
                    </div>
                    <div class="auth-field-group">
                        <label>Email</label>
                        <input type="email" id="signupEmail" placeholder="youremail@gmail.com" autocomplete="email">
                    </div>
                    <div class="auth-field-group">
                        <label>Phone Number <span style="font-weight:400;opacity:0.6;">(optional)</span></label>
                        <input type="tel" id="signupPhone" placeholder="09XXXXXXXXX" autocomplete="tel">
                    </div>
                    <div class="auth-field-group">
                        <label>Password</label>
                        <input type="password" id="signupPassword" placeholder="At least 8 characters" autocomplete="new-password">
                    </div>

                    <button class="auth-submit-btn" id="signupSubmitBtn">Create Account</button>
                </div>

                <div class="auth-panel" id="panelLogoutConfirm" style="display:none;">
                    <div class="auth-success-wrap">
                        <h2 class="auth-success-title">Logging Out?</h2>
                        <p class="auth-success-msg">Are you sure you want to log out of your account?</p>
                        <div style="display: flex; gap: 12px; width: 100%;">
                            <button class="auth-success-btn" id="logoutConfirmBtn" style="flex:1; background: #b91c1c;">Yes, Log Out</button>
                            <button class="auth-success-btn" id="logoutCancelBtn" style="flex:1; background: #8da4ae;">Cancel</button>
                        </div>
                    </div>
                </div>

                <div class="auth-panel" id="panelSuccess" style="display:none;">
                    <div class="auth-success-wrap">
                        <div class="auth-success-icon">
                            <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                                <circle class="auth-success-circle" cx="26" cy="26" r="24" fill="none" stroke-width="3"/>
                                <path class="auth-success-check" d="M14 26 L22 34 L38 18" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h2 class="auth-success-title" id="successTitle">Welcome back!</h2>
                        <p class="auth-success-msg" id="successMsg">You are now logged in.</p>
                        <button class="auth-success-btn" id="successDismissBtn">Continue</button>
                    </div>
                </div>

            </div>
        `;
        document.body.appendChild(modal);
        bindModalEvents();
    }

    function bindModalEvents() {
        const backdrop = document.getElementById('authBackdrop');
        const closeBtn = document.getElementById('authCloseBtn');

        // Close on backdrop or X
        backdrop.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);

        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => switchPanel(tab.dataset.tab));
        });

        // Switch link inside panels
        document.querySelectorAll('.auth-switch-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                switchPanel(link.dataset.target);
            });
        });

        // Login submit
        document.getElementById('loginSubmitBtn').addEventListener('click', handleLogin);
        document.getElementById('loginPassword').addEventListener('keydown', e => {
            if (e.key === 'Enter') handleLogin();
        });

        // Signup submit
        document.getElementById('signupSubmitBtn').addEventListener('click', handleSignup);

        // Logout Actions
        document.getElementById('logoutConfirmBtn').addEventListener('click', processLogout);
        document.getElementById('logoutCancelBtn').addEventListener('click', closeModal);

        // Success dismiss
        document.getElementById('successDismissBtn').addEventListener('click', closeModal);
    }

    function switchPanel(tab) {
        const isLogin = tab === 'login';
        document.getElementById('panelLogin').style.display         = isLogin ? 'block' : 'none';
        document.getElementById('panelSignup').style.display        = isLogin ? 'none'  : 'block';
        document.getElementById('panelSuccess').style.display       = 'none';
        document.getElementById('panelLogoutConfirm').style.display = 'none';
        
        document.querySelector('.auth-tab-row').style.display = 'flex';
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        clearErrors();
    }

    function showSuccess(title, msg) {
        document.querySelector('.auth-tab-row').style.display       = 'none';
        document.getElementById('panelLogin').style.display         = 'none';
        document.getElementById('panelSignup').style.display        = 'none';
        document.getElementById('panelLogoutConfirm').style.display = 'none';
        
        // Reset and trigger SVG dash animations
        const circle = document.querySelector('.auth-success-circle');
        const check = document.querySelector('.auth-success-check');
        if (circle && check) {
            circle.style.animation = 'none';
            check.style.animation = 'none';
            setTimeout(() => {
                circle.style.animation = '';
                check.style.animation = '';
            }, 10);
        }

        document.getElementById('panelSuccess').style.display  = 'block';
        document.getElementById('successTitle').textContent    = title;
        document.getElementById('successMsg').textContent      = msg;
    }

    function showLogoutConfirm() {
        document.querySelector('.auth-tab-row').style.display       = 'none';
        document.getElementById('panelLogin').style.display         = 'none';
        document.getElementById('panelSignup').style.display        = 'none';
        document.getElementById('panelSuccess').style.display       = 'none';
        document.getElementById('panelLogoutConfirm').style.display = 'block';
        
        document.getElementById('authModal').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function clearErrors() {
        document.getElementById('loginError').classList.remove('visible');
        document.getElementById('signupError').classList.remove('visible');
    }

    function showError(id, msg) {
        const el = document.getElementById(id);
        el.textContent = msg;
        el.classList.add('visible');
    }

    // ── PUBLIC API ──────────────────────────────────────────────────────────
    window.openAuthModal = function (tab = 'login') { openModal(tab); };
    window.doLogout      = function () { showLogoutConfirm(); };

    function openModal(tab = 'login') {
        switchPanel(tab);
        document.getElementById('authModal').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        document.getElementById('authModal').classList.remove('open');
        document.body.style.overflow = '';
    }

    // ── HANDLERS ────────────────────────────────────────────────────────────
    function handleLogin() {
        const email    = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btn      = document.getElementById('loginSubmitBtn');

        if (!email || !password) { showError('loginError', 'Please enter your email and password.'); return; }

        btn.disabled = true; btn.textContent = 'Logging in…';

        fetch(`${AUTH_URL}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                currentUser = data;
                applyLoggedInHeader(data);
                showSuccess('Welcome back!', 'You have logged in successfully.');
            } else {
                showError('loginError', data.message || 'Login failed.');
            }
        })
        .catch(() => showError('loginError', 'Network error. Please try again.'))
        .finally(() => { btn.disabled = false; btn.textContent = 'Log In'; });
    }

    function handleSignup() {
        const first    = document.getElementById('signupFirst').value.trim();
        const last     = document.getElementById('signupLast').value.trim();
        const email    = document.getElementById('signupEmail').value.trim();
        const phone    = document.getElementById('signupPhone').value.trim();
        const password = document.getElementById('signupPassword').value;
        const btn      = document.getElementById('signupSubmitBtn');

        if (!first || !last || !email || !password) { showError('signupError', 'Please fill in all required fields.'); return; }
        if (password.length < 8)                    { showError('signupError', 'Password must be at least 8 characters.'); return; }

        btn.disabled = true; btn.textContent = 'Creating account…';

        fetch(`${AUTH_URL}?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: first, last_name: last, email, phone, password })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                currentUser = data;
                applyLoggedInHeader(data);
                showSuccess('Account Created!', 'Your registration was completed successfully.');
            } else {
                showError('signupError', data.message || 'Registration failed.');
            }
        })
        .catch(() => showError('signupError', 'Network error. Please try again.'))
        .finally(() => { btn.disabled = false; btn.textContent = 'Create Account'; });
    }

    function processLogout() {
        fetch(`${AUTH_URL}?action=logout`)
            .then(() => {
                currentUser = null;
                applyGuestHeader();
                closeModal();
            })
            .catch(() => {
                closeModal();
            });
    }

    // ── EXPOSE current user for other scripts (e.g. bookAppointmentFunction.js) ──
    window.getAuthUser = function () { return currentUser; };

})();