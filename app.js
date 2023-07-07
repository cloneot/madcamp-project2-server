const express = require('express')
const path = require('path')
const session = require('express-session')
const app = express()
const http = require('http').Server(app);
const bodyParser = require('body-parser')
const connection = require('./db')

const port = 80

app.set('view engine', 'ejs')
app.set('views', './views')
// app.set('views', path.join(__dirname, '..', 'client', 'views'))
app.use(express.static('./public'))

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const io = require('socket.io')(3000, {
	cors: {
		origin: '*'
	}
});

//방 목록
const rooms = [];

//클라이언트가 연결됨
io.on('connection', function (socket) {

	//클라이언트가 roomdId로 참여 요청을 보매
	socket.on('join', function (roomId) {
		//roomId가 존재하는지 확인
		const room = rooms.find(r => r.id == roomId);
		if (!room) {
			socket.emit('joinError', '방이 존재하지 않습니다.');
			return;
		}
		//클라이언트 소켓을 해당 방에 연결
		socket.join(room.id);
		//방 전체에 참여자 알림
		socket.emit('joined', room.name);
	});

	//클라이언트가 새로운 방 생성 요청
	socket.on('create', function (roomName) {
		const newRoom = {
			id: Date.now().toString(),
			name: roomName
		};
		rooms.push(newRoom);
		socket.join(newRoom.id);
		socket.emit('created', newRoom);
	});
});

app.get('/test', (req, res) => {
	db.getAllMemos((rows) => {
		console.log('wowwow!!')
		res.render('test', {rows: rows})
	})
})

app.get('/login', (req, res) => {
	res.render('login');
});

//로그인 후 메인 페이지
app.get('/main', (req, res) => {
	res.render('mainPage', { rooms: rooms });
	//(path.join(__dirname, '..', 'client', 'public', 'html', 'mainPage.ejs'))
});

//메인 페이지에서 "방 참여하기" 클릭 시
app.get('/main/join-room', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'client', 'public', 'html', 'joinPage.html'));
});

//메인 페이지에서 "방 생성하기" 클릭 시
app.get('/main/create-room', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'client', 'public', 'html', 'createPage.html'));
});
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

app.get('/logout', (req, res) => {
	req.sessionId = false
})

app.listen(port, function () {
	console.log("Server started")
})
