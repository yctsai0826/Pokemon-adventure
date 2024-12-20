<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    session_start();

    if (!isset($_SESSION['username'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        exit;
    }

    $username = $_SESSION['username'];

    // Fetch selected Pokemon ID from session or local storage
    if (!isset($_GET['pokemonID'])) {
        echo json_encode(['status' => 'error', 'message' => 'Pokemon ID is required']);
        exit;
    }

    $pokemonID = intval($_GET['pokemonID']);

    // Fetch stats from PokemonTable
    $stmt = $pdo->prepare("SELECT pokemonLife, pokemonAttack FROM PokemonTable WHERE pokemonID = :pokemonID");
    $stmt->execute(['pokemonID' => $pokemonID]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode(['status' => 'success', 'pokemonLife' => $result['pokemonLife'], 'pokemonAttack' => $result['pokemonAttack']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Pokemon not found']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>
