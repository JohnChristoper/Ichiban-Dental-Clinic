<?php
// backend/admin_api.php
// Handles all admin CRUD operations:
//   - Appointments: list, delete
//   - Users (patients): list, delete
//   - Holidays: list, add, delete
//   - Services: list, add, delete

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

session_start();

// ── GUARD: admin only ────────────────────────────────────────────────────
if (empty($_SESSION['admin_logged_in'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/db.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// ════════════════════════════════════════════════════════════════════════════

// GET  ?action=appointments  — list all appointments with service name
if ($action === 'appointments' && $method === 'GET') {
    $stmt = $pdo->query("
        SELECT a.id, a.patient_type, a.booking_date, a.booking_time,
               a.first_name, a.last_name, a.email, a.phone,
               a.medical_notes, a.status,
               s.name AS service_name
        FROM   appointments a
        LEFT   JOIN services s ON s.id = a.service_id
        ORDER  BY a.booking_date DESC, a.booking_time DESC
    ");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// PATCH  ?action=complete_appointment&id=X  — mark appointment as completed
if ($action === 'complete_appointment' && $method === 'POST') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Missing appointment id.']);
        exit;
    }
    $pdo->prepare("UPDATE appointments SET status = 'completed' WHERE id = ?")->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

// DELETE  ?action=appointment&id=X  — remove one appointment + its booked slots
if ($action === 'appointment' && $method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Missing appointment id.']);
        exit;
    }
    $pdo->beginTransaction();
    $pdo->prepare("DELETE FROM booked_slots  WHERE appointment_id = ?")->execute([$id]);
    $pdo->prepare("DELETE FROM appointments  WHERE id = ?")->execute([$id]);
    $pdo->commit();
    echo json_encode(['success' => true]);
    exit;
}

// ════════════════════════════════════════════════════════════════════════════
// USERS (patients)
// ════════════════════════════════════════════════════════════════════════════

// GET  ?action=users  — list all patients
if ($action === 'users' && $method === 'GET') {
    $stmt = $pdo->query("
        SELECT id, first_name, last_name, email, phone, created_at
        FROM   patient_info
        ORDER  BY created_at DESC
    ");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// DELETE  ?action=user&id=X  — delete patient and all their appointments
if ($action === 'user' && $method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Missing user id.']);
        exit;
    }
    $pdo->beginTransaction();
    // Remove booked slots for this patient's appointments
    $pdo->prepare("
        DELETE bs FROM booked_slots bs
        INNER JOIN appointments a ON a.id = bs.appointment_id
        WHERE a.patient_id = ?
    ")->execute([$id]);
    $pdo->prepare("DELETE FROM appointments  WHERE patient_id = ?")->execute([$id]);
    $pdo->prepare("DELETE FROM patient_info  WHERE id = ?")->execute([$id]);
    $pdo->commit();
    echo json_encode(['success' => true]);
    exit;
}

// ════════════════════════════════════════════════════════════════════════════
// HOLIDAYS
// ════════════════════════════════════════════════════════════════════════════

// GET  ?action=holidays
if ($action === 'holidays' && $method === 'GET') {
    $stmt = $pdo->query("
        SELECT id, DATE_FORMAT(holiday_date, '%Y-%m-%d') AS holiday_date, label
        FROM   holidays
        ORDER  BY holiday_date ASC
    ");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// POST  ?action=holiday  body: { date, label }
if ($action === 'holiday' && $method === 'POST') {
    $body  = json_decode(file_get_contents('php://input'), true);
    $date  = trim($body['date']  ?? '');
    $label = trim($body['label'] ?? '');
    if (!$date) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Date is required.']);
        exit;
    }
    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD.']);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO holidays (holiday_date, label) VALUES (?, ?)");
    $stmt->execute([$date, $label ?: null]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// DELETE  ?action=holiday&id=X
if ($action === 'holiday' && $method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Missing holiday id.']);
        exit;
    }
    $pdo->prepare("DELETE FROM holidays WHERE id = ?")->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICES
// ════════════════════════════════════════════════════════════════════════════

// GET  ?action=services
if ($action === 'services' && $method === 'GET') {
    $stmt = $pdo->query("SELECT id, name, duration_hours FROM services ORDER BY id ASC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// POST  ?action=service  body: { name, duration_hours }
if ($action === 'service' && $method === 'POST') {
    $body  = json_decode(file_get_contents('php://input'), true);
    $name  = trim($body['name']           ?? '');
    $hours = floatval($body['duration_hours'] ?? 0);
    if (!$name || $hours <= 0) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Service name and duration are required.']);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO services (name, duration_hours) VALUES (?, ?)");
    $stmt->execute([$name, $hours]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// DELETE  ?action=service&id=X
if ($action === 'service' && $method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Missing service id.']);
        exit;
    }
    $pdo->prepare("DELETE FROM services WHERE id = ?")->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

// ── STATS for dashboard overview ─────────────────────────────────────────
if ($action === 'stats' && $method === 'GET') {
    $appts    = $pdo->query("SELECT COUNT(*) FROM appointments")->fetchColumn();
    $pending  = $pdo->query("SELECT COUNT(*) FROM appointments WHERE status='pending'")->fetchColumn();
    $users    = $pdo->query("SELECT COUNT(*) FROM patient_info")->fetchColumn();
    $holidays = $pdo->query("SELECT COUNT(*) FROM holidays WHERE holiday_date >= CURDATE()")->fetchColumn();
    $services = $pdo->query("SELECT COUNT(*) FROM services")->fetchColumn();
    echo json_encode([
        'success'  => true,
        'total_appointments' => (int)$appts,
        'pending_appointments' => (int)$pending,
        'total_users'    => (int)$users,
        'upcoming_holidays' => (int)$holidays,
        'total_services' => (int)$services,
    ]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);