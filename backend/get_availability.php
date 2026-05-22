<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    // 1. Fetch available clinic services
    $servicesStmt = $pdo->query("SELECT id, name, duration_label AS duration, duration_hours AS hours FROM services");
    $services = $servicesStmt->fetchAll();

    // 2. Fetch locked holiday block dates
    $holidayStmt = $pdo->query("SELECT holiday_date FROM clinic_holidays");
    $holidays = $holidayStmt->fetchAll(PDO::FETCH_COLUMN);

    // 3. Fetch pre-booked slots grouped by date
    $appmtStmt = $pdo->query("SELECT booking_date, TIME_FORMAT(booking_time, '%H:%i') as time_str FROM appointments");
    $appointmentsRaw = $appmtStmt->fetchAll();

    $bookedSlots = [];
    foreach ($appointmentsRaw as $row) {
        $date = $row['booking_date'];
        if (!isset($bookedSlots[$date])) {
            $bookedSlots[$date] = [];
        }
        $bookedSlots[$date][] = $row['time_str'];
    }

    echo json_encode([
        'services' => $services,
        'holidays' => $holidays,
        'bookedSlots' => $bookedSlots
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>  