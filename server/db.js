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


function getAllMemos(callback) {
	connection.query('SELECT * FROM users', (err, rows, fields) => {
		if(err)	throw err
		callback(rows)
	})
}

// connection.connect()
// connection.query('SELECT * from Users', (err, rows, fileds) => {
// 	if(err)	throw err;
// 	console.log('User info is: ', rows)
// })
// connection.end()

module.exports = {
	getAllMemos
}
