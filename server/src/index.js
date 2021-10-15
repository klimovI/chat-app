require('dotenv').config()

const cors = require('cors');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const randomWords = require('random-words');
const socketio = require("socket.io");

const Chat = require('./models/Chat');
const Message = require('./models/Message');

// Save all chats on the server to make less requests to the database 
let chats = [];

mongoose
  .connect(process.env.MONGODB_URL)
  .then(async () => {
    console.log('Database connected');

    // Get all chats from the database and save them
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

// Users set mapped to a socket room name
const usersMap = new Map();

/**
 * Returns a set of users in the room
 *
 * @param {string} room - Socket room name
 * @returns A set of users in the room
 */
const getUsersSet = room => {
  if (usersMap.has(room)) {
    return usersMap.get(room);
  }

  // Create a new set if id doesn't exist for this room
  const users = new Set();
  usersMap.set(room, users);

  return users;
}

io.on('connection', socket => {
  let chatID = null;
  let user = null;

  socket.on('join', data => {
    chatID = data.chatID;
    user = data.user;
  
    socket.join(chatID);

    const users = getUsersSet(chatID);

    // Register that a user joined the chat
    users.add(user);

    // Set chats list for this socket user
    socket.emit('setChats', chats);

    // Set users list for all socket users in this chat 
    io.to(chatID).emit('setUsers', [...users]);
  });

  
  socket.on('message', async (message, callback) => {
    // Save message to the database
    const newMessage = new Message({ ...message, chatID });
    const savedMessage = await newMessage.save();
    
    // Notify all socket users in this chat about a new message
    io.to(chatID).emit('message', savedMessage);
    
    callback();
  });

  /**
   * Handles user leave the chat or disconnect events
   */
  const disconnect = () => {
    if (chatID) {
      socket.leave(chatID);

      const users = getUsersSet(chatID);

      // Register that a user left the chat
      users.delete(user);

      // Set users list for all socket users in this chat 
      io.to(chatID).emit('setUsers', [...users]);
    }
  };
  
  socket.on('leave', disconnect);
  socket.on('disconnect', disconnect)
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

  if (chatID.length === 24) {
    const [chat, messages] = await Promise.all([
      Chat.findById(chatID).exec(),
      Message.find({ chatID })
    ]);
  
    // Check that a chat with this id exists
    if (chat) {
      return res.json(messages);
    }
  }

  res.json();
});

server.listen(3001, () => {
  console.log('Server started');
});
