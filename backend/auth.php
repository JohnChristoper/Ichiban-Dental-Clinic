<?php
// backend/auth.php
// Handles: login, register, logout, session check
// All responses are JSON.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

session_start();

require_once __DIR__ . '/db.php'; // reuses your existing $pdo

$action = $_GET['action'] ?? '';

// ── WHO AM I? (called on every page load) ──────────────────────────────────
if ($action === 'me') {
    if (!empty($_SESSION['patient_id'])) {
        echo json_encode([
            'loggedIn'   => true,
            'id'         => $_SESSION['patient_id'],
            'first_name' => $_SESSION['first_name'],
            'last_name'  => $_SESSION['last_name'],
            'email'      => $_SESSION['email'],
        ]);
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

// ── LOGIN / REGISTER — require POST body ────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) {
    echo json_encode(['success' => false, 'message' => 'No data received.']);
    exit;
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
if ($action === 'login') {
    $email    = trim($body['email']    ?? '');
    $password =      $body['password'] ?? '';

    if (!$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM patient_info WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Incorrect email or password.']);
        exit;
    }

    $_SESSION['patient_id'] = $user['id'];
    $_SESSION['first_name'] = $user['first_name'];
    $_SESSION['last_name']  = $user['last_name'];
    $_SESSION['email']      = $user['email'];

    echo json_encode([
        'success'    => true,
        'first_name' => $user['first_name'],
        'last_name'  => $user['last_name'],
        'email'      => $user['email'],
    ]);
    exit;
}

// ── REGISTER ───────────────────────────────────────────────────────────────
if ($action === 'register') {
    $first_name = trim($body['first_name'] ?? '');
    $last_name  = trim($body['last_name']  ?? '');
    $email      = trim($body['email']      ?? '');
    $password   =      $body['password']   ?? '';
    $phone      = trim($body['phone']      ?? '');

    if (!$first_name || !$last_name || !$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
        exit;
    }

    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
        exit;
    }

    // Check duplicate email
    $check = $pdo->prepare("SELECT id FROM patient_info WHERE email = ? LIMIT 1");
    $check->execute([$email]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'An account with this email already exists.']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $ins  = $pdo->prepare("
        INSERT INTO patient_info (first_name, last_name, email, password_hash, phone)
        VALUES (?, ?, ?, ?, ?)
    ");
    $ins->execute([$first_name, $last_name, $email, $hash, $phone ?: null]);
    $newId = $pdo->lastInsertId();

    $_SESSION['patient_id'] = $newId;
    $_SESSION['first_name'] = $first_name;
    $_SESSION['last_name']  = $last_name;
    $_SESSION['email']      = $email;

    echo json_encode([
        'success'    => true,
        'first_name' => $first_name,
        'last_name'  => $last_name,
        'email'      => $email,
    ]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);