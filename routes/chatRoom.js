const express = require('express');
const router = express.Router();
//const bodyParser = require('body-parser');
// const mongoose = require('../dbConnector'); // Import mongoose with the new configuration
const ChatRoom = require('../model/chatRoom');

// 채팅방 생성
router.post('/create', async (req, res) => {
  try {
    const { roomName, productId, orikkiriId, participants } = req.body;

    console.log(req.body);

    // 채팅방 생성
    const chatRoom = new ChatRoom({
      roomName: roomName,
      productId: productId || 0, // 기본값 0 설정
      orikkiriId: orikkiriId || 0, // 기본값 0 설정
      participants: participants,
    });
    console.log(chatRoom);
    // 채팅방 저장
    await chatRoom.save();

    res.json({ success: true, message: 'Chat room created successfully' });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 채팅방 목록 조회
router.get('/:tag', async (req, res) => {
  try {
    const { tag } = req.params;

    // 멤버가 참여한 채팅방 목록 조회
    const chatRooms = await ChatRoom.find({ 'participants.tag': tag });

    // 채팅방 목록과 인원 수 반환
    const chatRoomsWithParticipants = chatRooms.map(chatRoom => ({
      _id: chatRoom._id,
      name: chatRoom.name,
      productId: chatRoom.productId,
      orikkiriId: chatRoom.orikkiriId,
      participants: chatRoom.participants,
      participantCount: chatRoom.participants.length, // 인원 수 추가
    }));

    res.json(chatRoomsWithParticipants);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:chatRoomId/:tag', async (req, res) => {
  const { chatRoomId, tag } = req.params;

  try {
    // 채팅방 ID에 해당하는 메시지를 조회
    const chatRoom = await ChatRoom.findById(chatRoomId);
    
    // 사용자가 채팅방에 참여한 시간
    const joinTime = chatRoom.participants.find(participant => participant.tag === tag)?.joinTime;

    if (!joinTime) {
      return res.status(404).json({ error: 'User not found in the chat room' });
    }

    // 사용자가 참여한 시간 이후의 메시지 조회
    const messages = await ChatMessage.find({
      createdAt: { $gt: joinTime },
      room: chatRoomId,
    });

    // 조회된 메시지를 클라이언트에게 응답
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;