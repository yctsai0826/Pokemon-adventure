-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： localhost
-- 產生時間： 2024 年 12 月 19 日 17:52
-- 伺服器版本： 10.4.28-MariaDB
-- PHP 版本： 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `PokemonAdventure`
--

-- --------------------------------------------------------

--
-- 資料表結構 `game_history`
--

CREATE TABLE `game_history` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `trainer` varchar(50) NOT NULL DEFAULT 'trainer',
  `coins` int(11) NOT NULL DEFAULT 0,
  `normalballs` int(11) NOT NULL DEFAULT 0,
  `superballs` int(11) NOT NULL DEFAULT 0,
  `collected_pokemon` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `game_history`
--

INSERT INTO `game_history` (`id`, `username`, `trainer`, `coins`, `normalballs`, `superballs`, `collected_pokemon`) VALUES
(5, 'test', 'trainer03', 20, 1, 1, '[]'),
(6, 'Angus', 'trainer02', 1470, 1010, 1000, '[2,5,4,3,6,9,11,14,10,12,7,8,1]'),
(7, '陳冠智', 'none', 50, 0, 0, '[]'),
(8, '交大資工系學會', 'trainer', 0, 0, 0, '[]'),
(9, 'KUANCHIH CHEN', 'trainer03', 20, 0, 0, '[]');

-- --------------------------------------------------------

--
-- 資料表結構 `users`
--

CREATE TABLE `users` (
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `users`
--

INSERT INTO `users` (`username`, `password`, `email`) VALUES
('Angus', '$2y$10$FrCShfhqh.yzUWEGQu/VhOBsrGXkyooy4MRvFzaD4HkT3qqMAHcvG', 'tom204302@gmail.com'),
('KUANCHIH CHEN', '$2y$10$1.3iT0QYacPTGRqCWfBdpuH94uh3LNiUHi2eAESC.RwZx1ZD7bwIS', 'kuanchih0430@gmail.com'),
('test', '$2y$10$yu.3qMGhd9QgnXisZrMovebWhouI6K/3t/gOpTuZ20XkDMqXkSF..', 'test@tset'),
('交大資工系學會', '$2y$10$BeGZE5i.vlxjzNs22yGQ2eyDBlLqyxZKQiQjRMJDltEiUzROTH40u', 'csunion.nctu@gmail.com'),
('陳冠智', '$2y$10$Af46NjcJMz4XfSB4AHnqJOmBesMJazXOOYaRj2w5J/wNaNifkA6Uu', 'angus0430.cs11@nycu.edu.tw');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `game_history`
--
ALTER TABLE `game_history`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- 資料表索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `game_history`
--
ALTER TABLE `game_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
