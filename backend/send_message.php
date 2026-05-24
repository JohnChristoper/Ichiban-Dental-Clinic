<?php
// Include your existing PDO database connection instance
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Retrieve and sanitize form inputs
    $name    = isset($_POST['name']) ? trim($_POST['name']) : '';
    $phone   = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $email   = isset($_POST['email']) ? trim($_POST['email']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    // Simple validation validation check
    if (empty($name) || empty($phone) || empty($email) || empty($message)) {
        die("Error: All form fields are required.");
    }

    try {
        // Securely prepare the SQL statement
        $stmt = $pdo->prepare("
            INSERT INTO contact_messages (name, phone, email, message)
            VALUES (:name, :phone, :email, :message)
        ");

        // Execute and bind parameters to protect against SQL Injection
        $stmt->execute([
            ':name'    => $name,
            ':phone'   => $phone,
            ':email'   => $email,
            ':message' => $message
        ]);

        // Redirect back to the contact page with a success message indicator
        // You can update contact.html later to read this parameter or use alert alerts
        // TO THIS:
        header("Location: ../contact.html?status=success");
        exit;

    } catch (PDOException $e) {
        // Log errors securely or print out details if debugging locally
        die("Database entry failure: " . $e->getMessage());
    }
} else {
    // Redirect back to the form if accessed directly via URL
    header("Location: ../contact.html");
    exit;
}
?>