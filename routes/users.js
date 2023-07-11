const router = require('express').Router();
const connection = require('../db');

router.get('/test', (req, res) => {
	// console.log(req);
	return res.json([{id: 17, username: "junseo"}]);
});

router.route('/users/:userid')
	.get((req, res) => {
		let userid = req.params.userid;
		console.log(userid);
		// console.log(req);
		connection.query('SELECT * FROM users WHERE id = ?', [userid], function(error, results, fields) {
			console.log(results);
			if(error)	throw error;
			if(results.length > 0) {
				return res.json(results[0]);
			}
			else {
				return res.status(200).json();
			}
		});
	})
	.put((req, res) => {
		console.log('/users/:userid put request!!!');
		try {
			var userid = Number(req.params.userid);
			var username = req.body.username;
		} catch(e) {
			console.log('invalid request /users/:userid ${userid} ${username}');
		}
		console.log(userid, username);

		connection.query('SELECT * FROM users WHERE id = ?', [userid], function(error, results, fields) {
			if(error)	throw error;
			if(results.length > 0) {
				console.log('already exists!');
				return res.json([{'msg' : 'success'}]);
			}
			connection.query('INSERT INTO users (id, username) VALUES (?, ?)', [userid, username], function(error, results, fields) {
				if(error)	throw error;
				console.log('insert!');
				return res.json([{'msg' : 'success'}]);
			});
		});
	});

module.exports = router;
