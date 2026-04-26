<?php
session_start();
include "db.php";

$user_id = $_SESSION["user_id"];

$sql = "SELECT content_type, result, created_at 
        FROM verification_history 
        WHERE user_id='$user_id' 
        ORDER BY created_at DESC";

$result = $conn->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>