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
var rooms = [];
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

	//참가자가 대기화면 나감
	socket.on('playerLeaveWaitingRoom', function (data) {
		console.log('playerLeaveWaitingRoom');
		const room = rooms.find(r => r.id == data.room.id);
		if (data.mePlayer == 2) {
			room.player2 = '';
		}
		else if (data.mePlayer == 3) {
			room.player3 = '';
		}
		else if (data.mePlayer == 4) {
			room.player4 = '';
		}
		room.space++;
		socket.leave(data.room.id);
		//roomRefresh(room);
		io.to(data.room.id).emit('playerLeaveWaitingRoomFromServer', room);
		console.log('playerLeaveWaitingRoomFromServer');
	});

	//방장이 대기화면 나감
	socket.on('ownerLeaveWaitingRoom', function (data) {
		console.log('on ownerLeaveWaitingRoom');
		console.log(data);
		roomCloestMap.delete(data.id);
		roomTargetMap.delete(data.id);
		rooms = rooms.filter(r => r.id != data.id);
		socket.leave(data.id);
		io.to(data.id).emit('waitingRoomExplode');
		console.log('emit waitingRoomExplode');
		socket.broadcast.emit('getRoomListSuccess', rooms);
	});

	//방 폭파
	socket.on('leaveRoom', function (room) {
		socket.leave(room.id);
		console.log('leaveRoom');
		roomCloestMap.delete(room.id);
		roomTargetMap.delete(room.id);
		rooms = rooms.filter(r => r.id != room.id);
	});

	//클라이언트가 roomdId로 참여 요청을
	socket.on('joinRoom', function (data) {
		console.log('on joinRoom');
		console.log(rooms);
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
		socket.join(data.roomId);
		socket.broadcast.to(room.id).emit("newPlayer", data.nickName);

		// console.log(`join ${room.id}`);

		socket.emit("joinThisRoom", room);
		//방 전체에 참여자 알림
		//클라이언트 소켓을 해당 방에 연결
	});

	//클라이언트가 새로운 방 생성 요청
	socket.on('createRoom', function (data) {
		var id = Date.now().toString();
		var target = createRandomInt();
		console.log(target);
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
			isStart: 0,
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

function roomRefresh(room) {
	if (room.space == 1) {
		return room;
	} else if (room.space == 2) {
		if (room.player2 == '') {
			if (room.player3 == '') {
				room.player2 = room.player4;
				room.player4 = '';
				return room;
			} else {
				room.player2 = room.player3;
				room.player3 = '';
				return room;
			}
		} else {
			return room;
		}
	} else if (room.space == 3) {
		if (room.player2 == '') {
			room.player2 = room.player3;
			room.player3 = room.player4;
			room.player4 = '';
			return room;
		} else if (room.player3 == '') {
			room.player3 = room.player4;
			room.player4 = '';
			return room;
		} else {
			return room;
		}
	} else {
		return room;
	}
}

function createRandomInt() {
	var min = 30;
	var max = 500;
	var a = Math.random();
	if (a > 0.4) {
		min = 30;
		max = 100;
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	if (a > 0.1) {
		min = 101;
		max = 300;
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	else {
		min = 300;
		max = 500;
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
}