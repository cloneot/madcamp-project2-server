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
	console.log("asdf")
	// const filePath = path.join(__dirname, 'views', 'index.html');
	// res.sendFile(filePath);
	res.render('index', { title: 'Hey', message: 'Hello there!'})
});
