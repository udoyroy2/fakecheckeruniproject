<?php
session_start();
header("Content-Type: application/json");
include "db.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "Not logged in"]);
    exit();
}

$user_id = $_SESSION["user_id"];

$user_sql = "SELECT full_name, email FROM users WHERE user_id = '$user_id'";
$user_result = $conn->query($user_sql);

if (!$user_result || $user_result->num_rows == 0) {
    echo json_encode(["error" => "User not found"]);
    exit();
}

$user = $user_result->fetch_assoc();

$total_sql = "SELECT COUNT(*) AS total_count FROM verification_history WHERE user_id = '$user_id'";
$total = $conn->query($total_sql)->fetch_assoc()["total_count"];

$fake_sql = "SELECT COUNT(*) AS fake_count FROM verification_history WHERE user_id = '$user_id' AND result = 'FAKE'";
$fake = $conn->query($fake_sql)->fetch_assoc()["fake_count"];

$real_sql = "SELECT COUNT(*) AS real_count FROM verification_history WHERE user_id = '$user_id' AND result = 'REAL'";
$real = $conn->query($real_sql)->fetch_assoc()["real_count"];

echo json_encode([
    "name" => $user["full_name"],
    "email" => $user["email"],
    "total" => $total,
    "fake" => $fake,
    "real" => $real
]);

$conn->close();
?>