<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['pokemonID'])) {
        echo json_encode(['status' => 'error', 'message' => 'Pokemon ID is required']);
        exit;
    }

    $pokemonID = intval($_GET['pokemonID']);

    // Fetch difficulty from the database
    $stmt = $pdo->prepare("SELECT pokemonDifficulty FROM PokemonTable WHERE pokemonID = :pokemonID");
    $stmt->execute(['pokemonID' => $pokemonID]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode(['status' => 'success', 'difficulty' => $result['pokemonDifficulty']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Pokemon not found']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>
