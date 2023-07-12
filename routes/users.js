const router = require('express').Router();
const connection = require('../db');

router.put('/users/:userid/game_end', (req, res) => {
	console.log('put /users/:userid/game_end');
	try {
		var userid = Number(req.params.userid);
		var is_win = Boolean(req.body.is_win);
		connection.query('UPDATE users SET wins=wins+?, total_games=total_games+1 WHERE id=?', [is_win ? 1 : 0, userid], (err, results, fields) => {
			if(err)	throw err;
			console.log('update wins, total_games');
			return res.json([{'msg' : 'success'}]);
		});
	} catch(e) {
		console.log(`error: ${e}`);
	}
});

router.put('/users/:userid/description', (req, res) => {
	console.log('put /users/:userid/game_end');
	try {
		var userid = Number(req.params.userid);
		var description = String(req.body.description);
		connection.query('UPDATE users SET description=? WHERE id=?', [description, userid], (err, results, fields) => {
			if(err)	throw err;
			console.log('[REQUEST] update user description');
			return res.json([{'msg' : 'success'}]);
		});
	} catch(e) {
		console.log(`error: ${e}`);
	}
});

router.get('/users/:userid', (req, res) => {
		console.log('get /users/:userid get request');
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

router.put('/users/:userid', (req, res) => {
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
