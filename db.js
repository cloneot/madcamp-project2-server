const mysql = require('mysql')

const connection = mysql.createConnection({
	// host: '172.10.5.113',
	// user: 'root',
	host: 'localhost',
	user: 'junseo',
	password: 'madcamp',
	port: 3306,
	database: 'testdb'
})

module.exports = connection;
