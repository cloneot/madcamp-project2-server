DROP DATABASE IF EXISTS testdb;
CREATE DATABASE testdb;
USE testdb;

CREATE TABLE users (
	`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`username` VARCHAR(255),
	`email` VARCHAR(255)
);

INSERT INTO users (username, email) VALUES ('kimjunseo', 'junseo.kim@gmail.com');
INSERT INTO users (username, email) VALUES ('cloneot', 'cloneot@gmail.com');

/*
mysql -u root -p < server/schema.sql
password: madcamp
*/
