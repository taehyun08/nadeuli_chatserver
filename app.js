const express = require('express');
// const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const fs = require("fs");
const socketIO = require('socket.io');
// const mongoose = require('./dbConnector');
const { MongoClient } = require('mongodb');
const ChatRoom = require('./model/chatRoom');
const chatRoomRouter = require('./routes/chatRoom');
const path = require('path');
const mongoose = require('mongoose');

// MongoDB 연결 정보
const dbConfig = {
  host: 'mongodb://kcrt8.vpc.mg.naverncp.com:17017',
  dbName: 'nadeuli',
  user: 'nadeuli.nadeuli',
  password: 'Jason~1~1',
};

// MongoClient 생성
const client = new MongoClient(dbConfig.host, { useNewUrlParser: true, useUnifiedTopology: true });

// 연결
async function connect() {
  try {
    await client.connect();

    console.log('Connected to the database');

    // 여기에서 MongoDB에 대한 작업 수행
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  } finally {
    // 연결 종료
    await client.close();
  }
}

// 연결 실행
connect();

const options = {
  key: fs.readFileSync(path.resolve("/app/config/nadeuli.kr/privkey1.pem")),
  cert: fs.readFileSync(path.resolve("/app/config/nadeuli.kr/cert1.pem")),
  ca: fs.readFileSync(path.resolve('/app/config/nadeuli.kr/fullchain1.pem')),
};

const app = express();
const server = https.createServer(options,app);
const io = socketIO(server, {
  cors: {
    origin: '*'
  },
});
const PORT = 3001;



app.use(cors());
app.use(bodyParser.json());

app.use('/api/chatRoom', chatRoomRouter);




// Socket.io 연결 설정
io.on('connection', (socket) => {
  console.log('A user connected');



  // 채팅방 목록 조회
  const updateChatRooms = async (tag) => {
    try {
      // 멤버가 참여한 채팅방 목록 조회
      const chatRooms = await ChatRoom.find({ 'participants.tag': tag });
      io.to(tag).emit('chatRooms', chatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  // 채팅방 목록 초기화
  updateChatRooms();

  // 멤버가 채팅방에 참가
  socket.on('joinRoom', async ({roomId}) => {
    socket.emit('joinRoom', { roomId });
    console.log(roomId, '에 입장함');
  });

  socket.on('getChatrooms', ({ userId }) => {
    // 사용자가 참여한 채팅방 목록 조회
    const chatrooms = getChatroomsForUser(userId);
  
    // 클라이언트에 채팅방 목록 전송
    socket.emit('chatrooms', chatrooms);
  
    // 각 채팅방에 대해 소켓 연결 설정
    chatrooms.forEach((room) => {
      socket.join(room.id);
    });
  });

  // 멤버가 채팅방에서 나가기
  socket.on('leaveRoom', async (data) => {
    const { tag, roomId } = data;
    try {
      const chatRoom = await ChatRoom.findById(new mongoose.Types.ObjectId(roomId));

      if (chatRoom) {
        // 참가자 목록에서 제거
        chatRoom.participants = chatRoom.participants.filter(participant => participant.tag !== tag);
        await chatRoom.save();

        // 채팅방 메시지 조회
        // const messages = await ChatMessage.find({ room: roomId }).populate('sender');
        socket.emit('chatMessages', messages);

        // 채팅방 목록 갱신
        // updateChatRooms(tag);
      }
    } catch (error) {
      console.error('Error during leaving room:', error);
    }
  });

  // 채팅 메시지 전송
  socket.on('sendMessage', async ({tag, nickname, roomId, message}) => {
    try {
      const chatRoom = await ChatRoom.findById(new mongoose.Types.ObjectId(roomId));
      console.log(roomId);
      if (chatRoom) {
        const sender = {"tag" : tag, "name" : nickname};
  
        if (sender) {
          // 채팅 메시지 추가
          const createdAt = new Date();
          chatRoom.messages.push({
            sender,
            message,
            createdAt,
          });
  
          // 채팅방 업데이트
          await chatRoom.save();

          console.log('메세지 전송 : ');
          // 클라이언트에 채팅방 메시지 전송
          io.to(roomId).emit('sendMessage', {sender, message, createdAt});
        }
      }
    } catch (error) {
      console.error('Error during sending message:', error);
    }
  });

  // 연결 해제 시
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});