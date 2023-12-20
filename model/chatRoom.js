const mongoose = require('../dbConnector');

const chatRoomSchema = new mongoose.Schema({
  roomName: String,
  productId : Number,
  orikkiriId : Number,
  participants: [
    {
      tag: String, // 다른 디비에서 사용하는 member의 id 값
      name: String, // 다른 디비에서 사용하는 member의 이름
      joinTime: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  messages: [
    {
      sender: {
        tag: String, // 메시지를 보낸 사용자의 id 값
        name: String, // 메시지를 보낸 사용자의 이름
      },
      message: String, // 메시지 내용
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;