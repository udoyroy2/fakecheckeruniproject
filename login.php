<?php
session_start();
include "db.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $email = $_POST["email"];
    $password = $_POST["password"];

    $sql = "SELECT * FROM users WHERE email='$email'";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {

        $user = $result->fetch_assoc();

        if (password_verify($password, $user["password"])) {

            $_SESSION["user_id"] = $user["user_id"];
            $_SESSION["full_name"] = $user["full_name"];
            $_SESSION["email"] = $user["email"];
            $_SESSION["role"] = $user["role"];

            if ($user["role"] == "admin") {
                header("Location: admindashboard.html");
            } else {
                header("Location: userdashbord.html");
            }
            exit();

        } else {
            echo "<script>alert('Wrong password'); window.location.href='login.html';</script>";
        }

    } else {
        echo "<script>alert('Email not found'); window.location.href='login.html';</script>";
    }
}
?>