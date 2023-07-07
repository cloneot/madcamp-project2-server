const express = require('express');
const path = require('path');

const app = express();
const port = 80;

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.listen(port, function () {
	console.log("Server started");
});

app.get('/', (req, res) => {
	// if not logged in
	// redirect login

	// if logged in
	res.render('index', {title: 'Home', message: 'Hey'})
});

app.get('/login', (req, res) => {
	res.render('login')
})
