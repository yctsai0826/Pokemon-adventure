<?php
require 'config.php';

if (!isset($_SESSION['username'])) {
    header('Location: login.php');
    exit;
}

$username = $_SESSION['username'];

// Fetch user game data from game_history
$stmt = $pdo->prepare("SELECT * FROM game_history WHERE username = :username");
$stmt->execute(['username' => $username]);
$userData = $stmt->fetch(PDO::FETCH_ASSOC);


if (!$userData) {
    // Initialize data if not exist
    $stmt = $pdo->prepare("INSERT INTO game_history (username, trainer, coins, normalballs, superballs, collected_pokemon) VALUES (:username, :trainer, :coins, :normalballs, :superballs, :collected_pokemon)");
    $stmt->execute([
        'username' => $username,
        'trainer' => 'none',
        'coins' => 0,
        'normalballs' => 0,
        'superballs' => 0,
        'collected_pokemon' => '[]'
    ]);
    $userData = [
        'trainer' => 'none',
        'coins' => 0,
        'normalballs' => 0,
        'superballs' => 0,
        'collected_pokemon' => '[]'
    ];
}

setcookie('trainer', $userData['trainer'], time() + 3600, '/');
setcookie('coins', $userData['coins'], time() + 3600, '/');
setcookie('normalballs', $userData['normalballs'], time() + 3600, '/');
setcookie('superballs', $userData['superballs'], time() + 3600, '/');
setcookie('collected_pokemon', $userData['collected_pokemon'], time() + 3600, '/');

// Handle updates from the client
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputData = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
        exit;
    }

    $trainer = $inputData['trainer'] ?? $userData['trainer'];
    $coins = $inputData['coins'] ?? $userData['coins'];
    $normalballs = $inputData['normalballs'] ?? $userData['normalballs'];
    $superballs = $inputData['superballs'] ?? $userData['superballs'];
    $collected_pokemon = $inputData['collected_pokemon'] ?? $userData['collected_pokemon'];

    $stmt = $pdo->prepare("UPDATE game_history SET trainer = :trainer, coins = :coins, normalballs = :normalballs, superballs = :superballs, collected_pokemon = :collected_pokemon WHERE username = :username");
    $stmt->execute([
        'trainer' => $trainer,
        'coins' => $coins,
        'normalballs' => $normalballs,
        'superballs' => $superballs,
        'collected_pokemon' => $collected_pokemon,
        'username' => $_SESSION['username']
    ]);

    echo json_encode(['status' => 'success']);
    exit;
}

header('Location: game.html');
exit;
?>
