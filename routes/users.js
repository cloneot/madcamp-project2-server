const router = require('express').Router();
const connection = require('../db');

router.get('/test', (req, res) => {
	console.log(req);
	return res.json([{id: 17, username: "junseo"}]);
});

router.get('/users/:username', (req, res) => {
	let username = req.params.username;
	console.log(username);
	// console.log(req);
	connection.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
		console.log(results);
		if(error)	throw error;
		if(results.length > 0) {
			return res.json(results[0]);
		}
		else {
			return res.status(200).json();
		}
	});
});

module.exports = router;
