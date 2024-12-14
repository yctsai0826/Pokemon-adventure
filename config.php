<?php
// Database Configuration
$host = 'localhost';
$dbname = 'PokemonAdventure';
$username = 'root'; // 修改為您的資料庫使用者名稱
$password = '';     // 修改為您的資料庫密碼

// Connect to the Database
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

session_start();
?>
