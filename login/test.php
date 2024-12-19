<?php
require '../config.php';
require_once 'vendor/autoload.php'; // 引入 Composer 的 autoload

use Google\Client;

// 啟用 session
session_start();

// 初始化 Google Client
$client = new Client();
$client->setClientId('699993237758-antt39g58l5sbattkh0oi97ts8f0vc1o.apps.googleusercontent.com'); // 替換為你的 Google Client ID
$client->setClientSecret('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'); // 替換為你的 Google Client Secret
$client->setRedirectUri('http://localhost/Pokemon-adventure/login/google-callback.php'); // 替換為你的重定向 URI
$client->addScope('email');
$client->addScope('profile');

// 產生 Google 登入 URL
$google_login_url = $client->createAuthUrl();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google OAuth 測試</title>
</head>
<body>
    <h1>Google OAuth 測試跳轉</h1>
    <p>點擊下方按鈕測試 Google OAuth 跳轉功能：</p>
    <a href="<?php echo $google_login_url; ?>">Login with Google</a>
</body>
</html>
