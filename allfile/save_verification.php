<?php
session_start();
include "db.php";

if (!isset($_SESSION["user_id"])) {
    echo "Not logged in";
    exit();
}

$user_id = $_SESSION["user_id"];
$content_type = $_POST["type"];
$result = $_POST["result"];

$sql = "INSERT INTO verification_history (user_id, content_type, result)
        VALUES ('$user_id', '$content_type', '$result')";

$conn->query($sql);

echo "Saved";
?>