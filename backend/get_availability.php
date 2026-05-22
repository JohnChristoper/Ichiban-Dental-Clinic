<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ── DB CONFIG ─────────────────────────────────────────────────────────────────
// Adjust these if your credentials/db name differ
$host   = 'localhost';
$db     = 'ichiban_dental';   // ← change to your actual database name
$user   = 'root';              // ← change to your DB username
$pass   = '';                  // ← change to your DB password
$port   = 3306;
// ─────────────────────────────────────────────────────────────────────────────

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed: ' . $e->getMessage()]);
    exit;
}

// ── 1. SERVICES ───────────────────────────────────────────────────────────────
// Fetches all active services. Expects columns: id, name, duration_hours
// Adjust the table/column names below to match your actual schema.
$services = [];
try {
    $stmt = $pdo->query("
        SELECT id, name, duration_hours AS hours
        FROM services
        ORDER BY id ASC
    ");
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ensure hours is a number, not a string
    foreach ($services as &$s) {
        $s['hours'] = (float) $s['hours'];
    }
    unset($s);
} catch (PDOException $e) {
    // Table might be named differently — return empty and let JS fallback handle it
    $services = [];
}

// ── 2. HOLIDAYS ───────────────────────────────────────────────────────────────
// Expects a table `holidays` with a column `holiday_date` (DATE type, e.g. 2026-06-12)
$holidays = [];
try {
    $stmt = $pdo->query("
        SELECT DATE_FORMAT(holiday_date, '%Y-%m-%d') AS d
        FROM holidays
    ");
    $holidays = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'd');
} catch (PDOException $e) {
    $holidays = [];
}

// ── 3. BOOKED SLOTS ──────────────────────────────────────────────────────────
// Expects a table `appointments` with columns:
//   booking_date (DATE), booking_time (TIME or VARCHAR like '09:00')
// Returns: { "2026-06-15": ["09:00", "10:00"], ... }
$bookedSlots = [];
try {
    $stmt = $pdo->query("
        SELECT
            DATE_FORMAT(booking_date, '%Y-%m-%d') AS d,
            TIME_FORMAT(booking_time, '%H:%i')    AS t
        FROM appointments
        WHERE booking_date >= CURDATE()
        AND status NOT IN ('cancelled', 'rejected')
    ");
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $bookedSlots[$row['d']][] = $row['t'];
    }
} catch (PDOException $e) {
    $bookedSlots = (object)[];   // empty JSON object {}
}

echo json_encode([
    'services'    => $services,
    'holidays'    => $holidays,
    'bookedSlots' => $bookedSlots ?: (object)[],
    'clinicCaps'  => (object)[]
]);