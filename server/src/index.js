require('dotenv').config()
const express = require('express');
const socketio = require("socket.io");
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const randomWords = require('random-words');
const Chat = require('./src/models/Chat');
const Message = require('./src/models/Message');

let chats = [];

mongoose
  .connect(process.env.MONGODB_URL)
  .then(async () => {
    console.log('Database connected');

    chats = await Chat.find({});
  })
  .catch(console.log);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: '*'
  }
});

const usersMap = new Map();

const getUsers = room => {
  if (usersMap.has(room)) {
    return usersMap.get(room);
  }

  const users = new Set();
  usersMap.set(room, users);
  return users;
}

io.on('connection', socket => {
  let room = null;
  let userName = null;

  socket.on('join', ({ chatID, user }) => {
    room = chatID;
    userName = user;
  
    socket.join(room);

    const users = getUsers(room);
    users.add(user);

    socket.emit('setChats', chats);
    io.to(room).emit('setUsers', [...users]);
  });

  socket.on('leave', () => {
    socket.leave(room);

    const users = getUsers(room);
    users.delete(userName);

    io.to(room).emit('setUsers', [...users]);
  });

  socket.on('message', (message, callback) => {
    new Message({ ...message, chatID: room }).save();

    io.to(room).emit('message', message);

    callback();
  });

  socket.on('disconnect', () => {
    if (room) {
      socket.leave(room);

      const users = getUsers(room);
      users.delete(userName);

      io.to(room).emit('setUsers', [...users]);
    }
  })
});

// Creates a new chat and gives a response with it's id
app.post('/chat', async (_req, res) => {
  const newChat = new Chat({ name: randomWords() });
  const savedChat = await newChat.save();

  chats.push(savedChat);
  io.emit('setChats', chats);

  res.json(savedChat._id);
});

// Gets all messages for a given chat id
app.get('/chat/:chatID', async (req, res) => {
  const { chatID } = req.params;

  if (chatID.length !== 24) return res.json();

  const [chat, messages] = await Promise.all([
    Chat.findById(chatID).exec(),
    Message.find({ chatID })
  ]);

  if (chat) {
    res.json(messages);
  } else {
    res.json();
  }
});

const PORT = 3001 || process.env.PORT;
server.listen(PORT, () => {
  console.log(`Started on ${PORT}`);
});
