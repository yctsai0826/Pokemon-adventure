CREATE DATABASE IF NOT EXISTS PokemonAdventure;

USE PokemonAdventure;

CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS game_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    trainer VARCHAR(50) NOT NULL DEFAULT 'trainer',
    coins INT NOT NULL DEFAULT 0,
    normalballs INT NOT NULL DEFAULT 0,
    superballs INT NOT NULL DEFAULT 0,
    collected_pokemon TEXT DEFAULT NULL
);
