const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userID: String,
  name: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

const todoSchema = new mongoose.Schema({
  userID: String,
  id: String,
  title: String,
  completed:{
    type: Boolean,
    default: false
  },
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = { User, Todo };