const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*"
	}
});
const path = require('path')
const session = require('express-session')
const cors = require('cors');
const AuthRouter = require('./routes/auth')
const UserRouter = require('./routes/users')
const port = 80

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(cors({
	origin: "*"
}));
app.use(express.static('./public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
	secret: 'some secret here',
	resave: true,
	saveUninitialized: true
}))
app.use(AuthRouter);
app.use(UserRouter);

app.get('/', (req, res) => {
	// console.log(req.session)
	if (!req.session.loggedIn) {
		console.log('please login!')
		return res.redirect('login')
	}
	res.render('index', { title: 'Home', message: 'Hey', session: req.session })
});

//방 목록
var rooms = [
	{ id: '1', name: 'Room 1', owner: 'mingyu', space: '3', player2: '', player3: '', player4: '' }
];
var roomAnswerMap = new Map();
roomAnswerMap.set('1', 100);

//클라이언트가 연결됨
io.on('connection', function (socket) {
	console.log("connected");
	socket.on('disconnect', function () {
		console.log("disconnect");
	});

	//클라이언트가 채팅 내용 emit
	socket.on('enterChat', function (chat, room) {
		const roomIdValid = rooms.find(r => r.id == room.id);
		const roomNameValid = rooms.find(r => r.name == room.name);
		if (!roomIdValid || !roomNameValid) {
			socket.emit('roomDataError', '방이 존재하지 않습니다.');
			return;
		}
		if (roomAnswerMap.get(room.id) == transformChat2Int(chat)) {
			//정답 맞춤
			socket.emit('youWin');
		}
		//정답 틀림
		//정답 틀림
		//정답 틀림
		//정답 틀림
		//정답 틀림
		//정답 틀림
		//const difference = roomAnswerMap.get(room.id) - transformChat2Int(chat);
		//socket.emit('wrongAnswer', difference, chat);
		//정답 틀림
		//정답 틀림
		//정답 틀림
		//정답 틀림
		//정답 틀림
		//정답 틀림

	})

	//클라이언트가 roomdId로 참여 요청을 
	socket.on('joinRoom', function (data) {
		//roomId가 존재하는지 확인
		const room = rooms.find(r => r.id == data.roomId);
		if (!room) {
			socket.emit('wrongRoomId', '방이 존재하지 않습니다.');
			return;
		}
		if (room.space == 0) {
			socket.emit('noRoomSpace', '방이 다 찼습니다.');
			return;
		}
		if (room.space == 3) {
			room.player2 == data.nickName;
		}
		if (room.space == 2) {
			room.player3 == data.nickName;
		}
		if (room.space == 1) {
			room.player4 == data.nickName;
		}
		room.space = room.space - 1;
		socket.emit("joinThisRoom", room);
		//방 전체에 참여자 알림
		socket.to(room.id).emit("newPlayer", nickName);
		//클라이언트 소켓을 해당 방에 연결
		socket.join(room.id);
	});

	//클라이언트가 새로운 방 생성 요청
	socket.on('createRoom', function (data) {
		console.log('on createRoom');
		const newRoom = {
			id: Date.now().toString(),
			name: data.roomName,
			owner: data.nickName,
			place: '3',
			player2: '',
			player3: '',
			player4: '',
		};
		rooms.push(newRoom);
		//socket.join(newRoom.id);
		socket.emit('createRoomSuccess', newRoom);
		console.log('emit createRoomSuccess')
	});
});

//로그인 후 메인 페이지
app.get('/main', (req, res) => {
	res.render('mainPage', { rooms: rooms });
	//(path.join(__dirname, '..', 'client', 'public', 'html', 'mainPage.ejs'))
});

//"방 참여하기" 클릭시
app.get('/rooms/:roomId', (req, res) => {
	const roomId = req.params.roomId;
	res.render('roomPage', { roomId });
})

//메인 페이지에서 "방 참여하기" 클릭 시
app.get('/join-room', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'client', 'public', 'html', 'joinPage.html'));
});

//메인 페이지에서 "방 생성하기" 클릭 시
app.get('/main/create-room', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'client', 'public', 'html', 'createPage.html'));
});

httpServer.listen(port, function () {
	console.log("Server started")
})

function transformChat2Int(chat) {
	var sum = 0;
	for (var i = 0; i < chat.length; i++) {
		sum += chat[i];
	}
	return sum;
}