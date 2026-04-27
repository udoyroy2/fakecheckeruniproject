
<?php
if ($_SERVER["SERVER_NAME"] == "localhost" || $_SERVER["SERVER_NAME"] == "127.0.0.1") {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "fakecheckeruniproject";
} else {
    $servername = "sql100.infinityfree.com";
    $username = "if0_41757539";
    $password = "321716INFINITY";
    $dbname = "if0_41757539_fakecheckeruniproject";
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "DB failed: " . $conn->connect_error]));
}
?>