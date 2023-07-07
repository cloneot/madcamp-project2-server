const express = require('express')
const path = require('path')
const db = require('./db')

const app = express()
const port = 80

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', 'client', 'views'))

app.get('/test', (req, res) => {
	db.getAllMemos((rows) => {
		console.log('wowwow!!')
		res.render('test', {rows: rows})
	})
})

app.get('/', (req, res) => {
	// if not logged in
	// redirect login

	// if logged in
	res.render('index', {title: 'Home', message: 'Hey'})
});

app.get('/login', (req, res) => {
	res.render('login')
})

app.listen(port, function () {
	console.log("Server started");
});
