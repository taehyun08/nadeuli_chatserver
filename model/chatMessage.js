const mongoose = require('../dbConnector');

const chatMessageSchema = new mongoose.Schema({
  sender:  {
      tag: String, // 다른 디비에서 사용하는 member의 id 값
      name: String, // 다른 디비에서 사용하는 member의 이름
    },
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;