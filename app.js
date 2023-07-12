const axios = require("axios");
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
	{ id: '1', name: 'Room 1', owner: 'mingyu', target: 1, space: 3, player2: '', player3: '', player4: '' }
];
var roomTargetMap = new Map();
var roomCloestMap = new Map();

//클라이언트가 연결됨
io.on('connection', function (socket) {
	console.log("connected");
	socket.on('disconnect', function () {
		console.log("disconnect");
	});

	//클라이언트가 채팅 내용 emit
	socket.on('enterChat', function (data) {
		console.log("enterChat");
		axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${data.chat}`).then(response => {
			console.log('WORD EXIST!!');
			const room = rooms.find(r => r.id == data.room.id);
			if (!room || room.name != data['room'].name) {
				socket.emit('roomDataError', '방이 존재하지 않습니다.');
				console.log("roomDataError");
				return;
			}
			if (roomTargetMap.get(room.id) == transformChat2Int(data.chat)) {
				//정답 맞춤
				io.to(room.id).emit('someoneWin', data.myNickName);
				console.log("someoneWin");
				roomCloestMap.delete(room.id);
				return;
			}
			const difference = Math.abs(roomTargetMap.get(room.id) - transformChat2Int(data.chat));
			if (roomCloestMap.get(room.id).score > difference) {
				roomCloestMap.set(room.id, { 'nickName': data.myNickName, 'score': difference });
			}
			var sendData = { 'difference': difference, 'chat': data.chat, 'myNickName': data.myNickName };
			io.to(room.id).emit('wrongAnswer', sendData);
			console.log("wrongAnswer");
		}).catch(error => {
			socket.emit('noSuchWord', data.chat);
			console.log('NO SUCH WORD!!');
			return;
		});
	})

	//클라이언트가 방 나감
	socket.on('leaveRoom', function (room) {
		socket.leave(room.id);
	});

	//클라이언트가 roomdId로 참여 요청을
	socket.on('joinRoom', function (data) {

		console.log('emit joinRoom');
		//roomId가 존재하는지 확인
		const room = rooms.find(r => r.id == data.roomId);
		if (!room) {
			socket.emit('wrongRoomId', '방이 존재하지 않습니다.');
			console.log("wrongRoomId");
			return;
		}
		if (room.space == 0) {
			socket.emit('noRoomSpace', '방이 다 찼습니다.');
			console.log("noRoomSpace");
			return;
		}
		if (room.space == 3) {
			room.player2 = data.nickName;
		}
		if (room.space == 2) {
			room.player3 = data.nickName;
		}
		if (room.space == 1) {
			room.player4 = data.nickName;
		}
		room.space = room.space - 1;

		console.log(socket.rooms);
		socket.join(data.roomId);
		console.log(socket.rooms);
		socket.broadcast.to(room.id).emit("newPlayer", data.nickName);

		// console.log(`join ${room.id}`);

		socket.emit("joinThisRoom", room);
		//방 전체에 참여자 알림
		//클라이언트 소켓을 해당 방에 연결
	});

	//클라이언트가 새로운 방 생성 요청
	socket.on('createRoom', function (data) {
		var id = Date.now().toString();
		const target = createRandomInt();
		roomTargetMap.set(id, target);
		roomCloestMap.set(id, { 'nickName': data.nickName, 'score': 1000 });
		console.log('on createRoom');
		const newRoom = {
			id: id,
			name: data.roomName,
			owner: data.nickName,
			target: target,
			space: 3,
			player2: '',
			player3: '',
			player4: '',
		};
		rooms.push(newRoom);
		socket.join(newRoom.id);
		socket.emit('createRoomSuccess', newRoom);
		// console.log(`createRoomSucess new rooms: ${rooms}`);
		socket.broadcast.emit('getRoomListSuccess', rooms);
		console.log('emit createRoomSuccess')
	});

	//방장이 timeOver 알림
	socket.on('timeOver', (data) => {
		const winnerData = roomCloestMap.get(data.id);
		io.to(data.id).emit('timeOverFromServer', winnerData);
		console.log('timeOverFromServer',);
	});

	//클라이언트가 게임 시작 요청
	socket.on('gameStart', (data) => {
		console.log('gameStart');
		const room = rooms.find(r => r.id == data.roomId);
		if (room.owner == data.nickName) {
			socket.emit("timerStart");
			console.log('timerStart');
			io.to(room.id).emit('gameStartAllow');
			console.log('gameStartAllow');
			return;
		}
		socket.emit('youAreNotOwner');
		console.log('youAreNotOwner');
	});

	socket.on('getRoomList', function (data) {
		console.log(`emit getRoomListSuccess ${rooms.toString()}`);
		socket.emit('getRoomListSuccess', rooms);
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
	var i;
	for (i = 0; i < chat.length; i++) {
		const num = chat.charCodeAt(i);
		if (num > 96) {
			sum += num - 96;
			continue;
		}
		sum += num - 64;
	}
	return sum;
}

function createRandomInt() {
	const min = 30;
	const max = 500;
	if (Math.random() > 0.5) {
		return Math.floor(Math.random)
	}
}
