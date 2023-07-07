const express = require('express');
const path = require('path');

const app = express();
const port = 80;

app.listen(port, function () {
	console.log("Server started");
});

app.get('/', (req, res) => {
	const filePath = path.join(__dirname, 'views', 'index.html');
	res.sendFile(filePath);
});
