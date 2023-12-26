const express = require('express');
const router = express.Router();
//const bodyParser = require('body-parser');
const ChatRoom = require('../model/chatRoom');

// 채팅방 생성
router.post('/findOrCreate', async (req, res) => {
  try {
    const { tag, productId, participants, title, orikkiriId } = req.body;

    // 채팅방 찾기
    const existingRoom = await ChatRoom.findOne({
      productId,
      participants: {
        $elemMatch: { tag },
      },
    });

    if (existingRoom) {
      // 이미 존재하는 방이면 조회로 이동
      res.json({ success: true, message: 'Chat room found successfully', chatRoomId: existingRoom._id });
    } else {
      // 존재하지 않는 방이면 새로운 방 생성
      const chatRoom = new ChatRoom({
        roomName: title,
        productId: productId || 0,
        orikkiriId: orikkiriId || 0,
        participants: participants,
      });

      // 채팅방 저장
      const savedChatRoom = await chatRoom.save();

      res.json({ success: true, message: 'Chat room created successfully', chatRoomId: savedChatRoom._id });
    }
  } catch (error) {
    console.error('Error finding or creating chat room:', error);
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
      lastMessage: chatRoom.messages.length > 0 ? chatRoom.messages[chatRoom.messages.length - 1] : null,
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
    const messages = chatRoom.messages.filter(message => message.createdAt > joinTime);
    
    console.log(messages);

    // 조회된 메시지를 클라이언트에게 응답
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/joinChatRoom', async (req, res) => {
  try {
    const { orikkiriId, participant } = req.body;
    console.log(req);
    // orikkiriId가 주어진 경우, 기존 채팅방에 참가
    if (orikkiriId) {
      const existingChatRoom = await ChatRoom.findOne({ orikkiriId });

      if (!existingChatRoom) {
        return res.status(404).json({ error: '채팅방이 존재하지 않습니다.' });
      }

      existingChatRoom.participants.push(participant);
      await existingChatRoom.save();

      return res.status(200).json(existingChatRoom);
    }
  } catch (error) {
    console.error('채팅방 참가 요청 중 오류:', error);
    res.status(500).json({ error: '서버 오류입니다.' });
  }
});

module.exports = router;