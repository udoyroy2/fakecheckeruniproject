<?php
session_start();
header("Content-Type: application/json");
include "db.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "Not logged in"]);
    exit();
}

$user_id = $_SESSION["user_id"];

// Get from DB directly - more reliable than session
$sql = "SELECT full_name, email FROM users WHERE user_id='$user_id'";
$result = $conn->query($sql);

if ($result->num_rows == 1) {
    $user = $result->fetch_assoc();
    echo json_encode([
        "full_name" => $user["full_name"],
        "email"     => $user["email"]
    ]);
} else {
    echo json_encode([
        "error" => "User not found"
    ]);
}
?>