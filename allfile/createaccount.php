<?php
include "db.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $full_name = $_POST["full_name"];
    $email = $_POST["email"];
    $password = $_POST["password"];
    $confirm_password = $_POST["confirm_password"];

    if ($password !== $confirm_password) {
        echo "<script>alert('Password does not match'); window.location.href='createaccount.html';</script>";
        exit();
    }

    $check = "SELECT * FROM users WHERE email='$email'";
    $result = $conn->query($check);

    if ($result->num_rows > 0) {
        echo "<script>alert('Email already exists'); window.location.href='createaccount.html';</script>";
        exit();
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (full_name, email, password, role)
            VALUES ('$full_name', '$email', '$hashed_password', 'user')";

    if ($conn->query($sql) === TRUE) {
        echo "<script>alert('Account created successfully'); window.location.href='login.html';</script>";
    } else {
        echo "Error: " . $conn->error;
    }

    $conn->close();
}
?>