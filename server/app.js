const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);

const io = require('socket.io')(3000, {
	cors: {
		origin: '*'
	}
});

//방 목록
const rooms = [];
const port = 80;

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

//정적 파일을 제공하기 위해 express에 미들웨어 추가
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'client', 'views'));

app.listen(port, function () {
	console.log("Server started");
});

app.get('/', (req, res) => {
	// if not logged in
	// redirect login

	// if logged in
	res.render('index', { title: 'Home', message: 'Hey' });
});

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