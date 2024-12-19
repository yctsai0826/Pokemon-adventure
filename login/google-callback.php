<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require '../config.php';
require_once 'vendor/autoload.php';

use Google\Client;
use Google\Service\Oauth2;

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$client = new Client();
$client->setClientId('699993237758-antt39g58l5sbattkh0oi97ts8f0vc1o.apps.googleusercontent.com');
$client->setClientSecret('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');
$client->setRedirectUri('http://localhost/Pokemon-adventure/login/google-callback.php'); // 替換為你的重定向 URI
$client->addScope('email');
$client->addScope('profile');

if (isset($_GET['code'])) {
    try {
        $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
        if (isset($token['error'])) {
            throw new Exception('Error fetching access token: ' . $token['error']);
        }

        $client->setAccessToken($token);

        $google_oauth = new Oauth2($client);
        $google_account_info = $google_oauth->userinfo->get();
        $email = $google_account_info->email;
        $name = $google_account_info->name;

        // 檢查使用者是否已經註冊
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            // 如果未註冊，則新增到資料庫
            $default_password = password_hash(bin2hex(random_bytes(8)), PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (:username, :email, :password)");
            $stmt->execute(['username' => $name, 'email' => $email, 'password' => $default_password]);
        }

        // 顯示使用者資訊和註冊狀態
        echo "<h1>登入成功</h1>";
        echo "<p>姓名: $name</p>";
        echo "<p>電子郵件: $email</p>";
        echo $user ? "<p>此帳號已存在。</p>" : "<p>帳號已註冊。</p>";
        $_SESSION['username'] = $name;
        // 跳轉到遊戲頁面
        header("Location: ../game.php");
        exit;

    } catch (Exception $e) {
        echo '<h1>發生錯誤</h1>';
        echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
    }
} else {
    echo "Invalid request. No authorization code found.";
}
