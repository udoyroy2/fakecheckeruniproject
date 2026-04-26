<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["error" => "Not logged in"]);
    exit();
}

echo json_encode([
    "full_name" => $_SESSION["full_name"],
    "email" => $_SESSION["email"]
]);
?>