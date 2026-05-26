<?php
// backend/admin_auth.php
// Handles admin login, logout, and session check.
// All responses are JSON.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

session_start();

$action = $_GET['action'] ?? '';

// ── WHO AM I? ──────────────────────────────────────────────────────────────
if ($action === 'me') {
    if (!empty($_SESSION['admin_logged_in'])) {
        echo json_encode(['loggedIn' => true, 'email' => $_SESSION['admin_email']]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
    exit;
}

// ── LOGOUT ─────────────────────────────────────────────────────────────────
if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) {
    echo json_encode(['success' => false, 'message' => 'No data received.']);
    exit;
}

if ($action === 'login') {
    $email    = trim($body['email']    ?? '');
    $password =      $body['password'] ?? '';

    // ── HARDCODED ADMIN CREDENTIALS ────────────────────────────────────────
    // Change these to something secure in production!
    $ADMIN_EMAIL    = 'admin';
    $ADMIN_PASSWORD = 'admin';

    if ($email === $ADMIN_EMAIL && $password === $ADMIN_PASSWORD) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_email']     = $email;
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid admin credentials.']);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);
