<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Load your existing PDO configuration instance
require_once 'db.php';

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
$required = ['patient_type', 'service_id', 'booking_date', 'booking_time',
            'first_name', 'last_name', 'email', 'phone', 'duration_hours'];

foreach ($required as $field) {
    if (empty($input[$field]) && $input[$field] !== 0) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
        exit;
    }
}

$patientId     = isset($input['patient_id']) ? intval($input['patient_id']) : null;
$patientType   = $input['patient_type'];
$serviceId     = intval($input['service_id']); 
$bookingDate   = $input['booking_date'];
$bookingTime   = $input['booking_time'];
$firstName     = $input['first_name'];
$lastName      = $input['last_name'];
$email         = $input['email'];
$phone         = $input['phone'];
$notes         = $input['notes'] ?? '';
$durationHours = intval($input['duration_hours']);

// Format clean SQL execution stamps
$formattedTime = date('H:i:s', strtotime($bookingTime));

try {
    // Start PDO transaction monitoring sequence block
    $pdo->beginTransaction();

    // 1. SAVE TO MASTER APPOINTMENTS TABLE
    $stmt = $pdo->prepare("
        INSERT INTO appointments
            (patient_id, patient_type, service_id, booking_date, booking_time,
             first_name, last_name, email, phone, medical_notes, status)
        VALUES
            (:patient_id, :patient_type, :service_id, :booking_date, :booking_time,
             :first_name, :last_name, :email, :phone, :medical_notes, 'pending')
    ");

    $stmt->execute([
        ':patient_id'    => $patientId,
        ':patient_type'  => $patientType,
        ':service_id'    => $serviceId,
        ':booking_date'  => $bookingDate,
        ':booking_time'  => $formattedTime,
        ':first_name'    => $firstName,
        ':last_name'     => $lastName,
        ':email'         => $email,
        ':phone'         => $phone,
        ':medical_notes' => $notes,
    ]);

    // Grab the database ID number generated for this appointment row entry
    $appointmentId = $pdo->lastInsertId();

    // 2. LOOP THROUGH AND BLOCK OUT EACH HOUR SLOT ON THE CALENDAR
    $startHour = (int)date('H', strtotime($bookingTime));

    for ($i = 0; $i < $durationHours; $i++) {
        $currentHourBlock = $startHour + $i;
        $computedTimeSlot = str_pad($currentHourBlock, 2, '0', STR_PAD_LEFT) . ":00:00";

        $slotStmt = $pdo->prepare("
            INSERT INTO booked_slots (appointment_id, booking_date, booking_time)
            VALUES (:appointment_id, :booking_date, :booking_time)
        ");
        $slotStmt->execute([
            ':appointment_id' => $appointmentId,
            ':booking_date'   => $bookingDate,
            ':booking_time'   => $computedTimeSlot
        ]);
    }

    // Commit changes safely to database
    $pdo->commit();

    echo json_encode([
        'success'        => true,
        'appointment_id' => $appointmentId,
        'message'        => 'Appointment and calendar blocks locked completely!'
    ]);

} catch (PDOException $e) {
    // Rollback changes completely if any error occurs
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    // Catch unique entry collision errors (MySQL Error code 23000 indicates unique duplicate values)
    if ($e->getCode() == 23000 || strpos($e->getMessage(), '1062') !== false) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'That slot is already booked. Please choose another time.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database failure details: ' . $e->getMessage()]);
    }
}