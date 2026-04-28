<?php
session_start();
header("Content-Type: application/json");
require "config.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false]);
    exit();
}

$id = $_POST["id"] ?? 0;
$userId = $_SESSION["user_id"];

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$stmt = $conn->prepare("DELETE FROM verification_history WHERE id=? AND user_id=?");
$stmt->bind_param("ii", $id, $userId);
$stmt->execute();

echo json_encode(["success" => true]);
?>