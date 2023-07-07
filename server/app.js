const express = require('express')
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser')
const connection = require('./db')

const app = express()
const port = 80

app.use(express.static('public'))
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', 'client', 'views'))

app.get('/test', (req, res) => {
	db.getAllMemos((rows) => {
		console.log('wowwow!!')
		res.render('test', {rows: rows})
	})
})

app.get('/', (req, res) => {
	if(!req.session.loggedIn) {
		console.log('please login!')
		return res.redirect('./login')
	}
	res.render('index', {title: 'Home', message: 'Hey', session: req.session})
});

app.route('/login')
	.get((req, res) => {
		res.render('login')
	})
	.post((req, res) => {
		let username = req.body.username
		let password = req.body.password
		if(username && password) {
			connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
				console.log(results)
				if (error) throw error
				if (results.length > 0) {
					req.session.loggedIn = true
					req.session.username = username
					console.log('what?')
					res.redirect('/')
					res.end()
				} else {
					res.send('Incorrect Username and/or Password!')
					res.end()
				}
			})
		}
		else {
			res.send('empty field exists!')
			res.end()
		}
	})

app.post('/logout', (req, res) => {
	req.sessionId = false

})

app.listen(port, function () {
	console.log("Server started")
})
