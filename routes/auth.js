const router = require('express').Router();
const connection = require('../db');

router.route('/login')
	.get((req, res) => {
		if(req.session.loggedIn === true) {
			return res.redirect('/');
		}
		res.render('login')
	})
	.post((req, res) => {
		// to do

		// let username = req.body.username;
		// let password = req.body.password;
		// if(username && password) {
		// 	connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
		// 		// console.log(results);
		// 		if (error) throw error;
		// 		if (results.length > 0) {
		// 			req.session.loggedIn = true;
		// 			req.session.username = username;
		// 			console.log('what?');
		// 			res.redirect('/');
		// 			res.end();
		// 		} else {
		// 			res.send('Incorrect Username and/or Password!');
		// 			res.end();
		// 		}
		// 	})
		// }
		// else {
		// 	res.send('empty field exists!');
		// 	res.end();
		// }
	});

router.get('/logout', (req, res) => {
	req.sessionId = false;
	res.redirect('/');
});

module.exports = router;
