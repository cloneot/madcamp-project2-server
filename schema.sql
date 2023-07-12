DROP DATABASE IF EXISTS testdb;
CREATE DATABASE testdb;
USE testdb;

CREATE TABLE users (
	`id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`username` VARCHAR(32) UNIQUE,
	`description` VARCHAR(256) DEFAULT 'empty description',
	`wins` INT DEFAULT 0,
	`total_games` INT DEFAULT 0
);

CREATE TABLE histories (
	`id` INT AUTO_INCREMENT PRIMARY KEY,
	`owner` VARCHAR(32),
	`player2` VARCHAR(32),
	`player3` VARCHAR(32),
	`player4` VARCHAR(32),
	`winner_index` INT NOT NULL
);

INSERT INTO users (username) VALUES ('test');
INSERT INTO users (username) VALUES ('kimjunseo');
INSERT INTO users (username) VALUES ('cloneot');

INSERT INTO histories (owner, player2, player3, player4, winner_index) VALUES ('김준서', 'guest1234', 'guest9999', 'guest1248', 1);
INSERT INTO histories (owner, player2, player3, player4, winner_index) VALUES ('guest8888', 'guest1234', '김준서', 'guest1248', 2);
INSERT INTO histories (owner, player2, player3, player4, winner_index) VALUES ('dummy', '김준서', 'guest9999', 'guest1248', 0);
INSERT INTO histories (owner, player2, player3, player4, winner_index) VALUES ('김준서', NULL, 'guest9999', 'guest1248', 1);

/*
mysql -u root -p < server/schema.sql
password: madcamp
*/
