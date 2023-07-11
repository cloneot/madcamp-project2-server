DROP DATABASE IF EXISTS testdb;
CREATE DATABASE testdb;
USE testdb;

CREATE TABLE users (
	`id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`username` VARCHAR(255) UNIQUE,
	`description` VARCHAR(255) DEFAULT '',
	`wins` INT DEFAULT 0,
	`total_games` INT DEFAULT 0
);
	-- `password` VARCHAR(255),
	-- `email` VARCHAR(255)

INSERT INTO users (username) VALUES ('test');
INSERT INTO users (username) VALUES ('kimjunseo');
INSERT INTO users (username) VALUES ('cloneot');

-- INSERT INTO users (username, email, password) VALUES ('test', 'test', 'test');
-- INSERT INTO users (username, email, password) VALUES ('kimjunseo', 'junseo.kim@gmail.com', 'password1');
-- INSERT INTO users (username, email, password) VALUES ('cloneot', 'cloneot@gmail.com', 'password2');

/*
mysql -u root -p < server/schema.sql
password: madcamp
*/
