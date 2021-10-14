const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  name: {
    type: String
  },
});

module.exports = mongoose.model('Chat', ChatSchema);
