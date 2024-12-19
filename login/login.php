<?php
require '../config.php';
require_once 'vendor/autoload.php'; // 引入 Composer 的 autoload

use Google\Client;
use Google\Service\Oauth2;

// 啟用 session
session_start();

// 初始化 Google Client
$client = new Client();

$client->setRedirectUri('http://localhost/Pokemon-adventure/login/google-callback.php'); // 替換為你的重定向 URI
$client->addScope('email');
$client->addScope('profile');

// 產生 Google 登入 URL
$google_login_url = $client->createAuthUrl();

// 普通登入處理
if (isset($_POST['login'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['username'] = $username;
            header("Location: ../game.php");
            exit;
        } else {
            echo "<p style='color:red;'>Invalid username or password.</p>";
        }
    } catch (PDOException $e) {
        echo "<p style='color:red;'>Database error: " . htmlspecialchars($e->getMessage()) . "</p>";
    }
}

// Google 登入處理
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

        // 設定 session 並跳轉
        $_SESSION['username'] = $name;
        header("Location: ../game.php");
        exit;

    } catch (Exception $e) {
        echo '<h1>Error</h1>';
        echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="login.css">
</head>
<body>
    <h1>Login</h1>
    <form method="post">
        <label for="username">Username:</label>
        <input type="text" name="username" id="username" required>
        <label for="password">Password:</label>
        <input type="password" name="password" id="password" required>
        <button type="submit" name="login">Login</button>
    </form>
    <p>Don't have an account? <a href="register.php">Register here</a>.</p>
    <p>Or login with:</p>
    <a href="<?php echo htmlspecialchars($google_login_url, ENT_QUOTES, 'UTF-8'); ?>" class="google-login-button">
        <img src="../img/google.png" alt="Google Login" class="google-login-icon">
    </a>

</body>
</html>
