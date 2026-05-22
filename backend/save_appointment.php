<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// ── DB CONFIG ─────────────────────────────────────────────────────────────────
$host = 'localhost';
$db   = 'ichiban_dental';
$user = 'root';
$pass = '';
$port = 3306;
// ─────────────────────────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or empty request body.']);
    exit;
}

// ── VALIDATE REQUIRED FIELDS ─────────────────────────────────────────────────
$required = ['patient_type', 'service_name', 'booking_date', 'booking_time',
             'first_name', 'last_name', 'email', 'phone'];

foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit;
    }
}

// ── SANITIZE ─────────────────────────────────────────────────────────────────
$patientType   = htmlspecialchars(trim($input['patient_type']));
$serviceName   = trim($input['service_name']);
$bookingDate   = trim($input['booking_date']);
$bookingTime   = trim($input['booking_time']);
$firstName     = htmlspecialchars(trim($input['first_name']));
$lastName      = htmlspecialchars(trim($input['last_name']));
$email         = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$phone         = htmlspecialchars(trim($input['phone']));
$notes         = htmlspecialchars(trim($input['notes'] ?? ''));

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $bookingDate) ||
    !preg_match('/^\d{2}:\d{2}$/', $bookingTime)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid date or time format.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

// ── CONNECT ───────────────────────────────────────────────────────────────────
try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

// ── LOOK UP service_id FROM service_name ──────────────────────────────────────
try {
    $svc = $pdo->prepare("SELECT id, duration_hours FROM services WHERE name = :name LIMIT 1");
    $svc->execute([':name' => $serviceName]);
    $service = $svc->fetch(PDO::FETCH_ASSOC);

    if (!$service) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => "Service not found: $serviceName"]);
        exit;
    }

    $serviceId     = (int) $service['id'];
    $durationHours = isset($input['duration_hours'])
                     ? (float) $input['duration_hours']
                     : (float) $service['duration_hours'];

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Could not look up service.']);
    exit;
}

// ── DUPLICATE BOOKING GUARD ───────────────────────────────────────────────────
try {
    $check = $pdo->prepare("
        SELECT COUNT(*) FROM appointments
        WHERE booking_date = :date
          AND booking_time = :time
          AND status NOT IN ('cancelled')
    ");
    $check->execute([':date' => $bookingDate, ':time' => $bookingTime]);
    if ((int) $check->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'message' => 'That slot is already booked. Please choose another time.']);
        exit;
    }
} catch (PDOException $e) {
    // proceed anyway
}

// ── INSERT ────────────────────────────────────────────────────────────────────
try {
    $stmt = $pdo->prepare("
        INSERT INTO appointments
            (patient_type, service_id, booking_date, booking_time,
             first_name, last_name, email, phone,
             medical_notes, status)
        VALUES
            (:patient_type, :service_id, :booking_date, :booking_time,
             :first_name, :last_name, :email, :phone,
             :medical_notes, 'pending')
    ");

    $stmt->execute([
        ':patient_type'  => $patientType,
        ':service_id'    => $serviceId,
        ':booking_date'  => $bookingDate,
        ':booking_time'  => $bookingTime,
        ':first_name'    => $firstName,
        ':last_name'     => $lastName,
        ':email'         => $email,
        ':phone'         => $phone,
        ':medical_notes' => $notes,
    ]);

    echo json_encode([
        'success'        => true,
        'appointment_id' => $pdo->lastInsertId(),
        'message'        => 'Appointment booked successfully.'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}