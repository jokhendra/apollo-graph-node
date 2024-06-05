const express = require('express');
const {ApolloServer} = require('@apollo/server');
const {expressMiddleware} = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const {User, Todo} = require('./db.mongoose');
const mongoose = require('mongoose');

// Connect to MongoDB

async function connectDB(){
  await mongoose.connect('mongodb://127.0.0.1:27017/graphql');
  // message when connected to MongoDB
  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
  });
}




// Creating  10 users


async function startServer(){
  const app = express();
  await connectDB();
  const server = new ApolloServer({
    typeDefs:`
      type Mutation {
        createUser(userID:ID!, name:String!, email:String!):User
        createTodo(userID:ID!, id:ID!, title:String!, completed:Boolean!):Todo
        updateUser(userID: ID!, name: String, email: String): User
        updateTodo(id: ID!, title: String, completed: Boolean): Todo
        deleteUser(userID: ID!): User
        deleteTodoByID(id: ID!): Todo
      }
      type User {
        userID:ID!
        name:String!
        email:String!
        todos: [Todo]
      }
      type Todo {
        userID:ID!
        id:ID!
        title:String!
        completed:Boolean!
      }
      type Query {
        getUserByID(userID:ID!):User
        getUsers : [User]
        getTodoByID(id:ID!):Todo
        getTodos : [Todo]
        todosByUserID(userID: String!): [Todo]
      }
      `,
    resolvers: {
      User: {
        todos: async (parent) => {
          return await Todo.find({userID: parent.userID});
        }
      },
      Mutation: {
        createUser: async(parent, args, context, info) => {
          const user = new User({
            userID: args.userID,
            name: args.name,
            email: args.email
          });
          await user.save();
          return user;
        },
        updateUser: async (_, { userID, name, email }) => {
          // Logic to update the user in the database
          const user = await User.findOneAndUpdate({userID}, { name, email }, { new: true });
          return user;
        },
        deleteUser: async (_, { userID }) => {
          // Logic to delete the user from the database
          const user = await User.findOneAndDelete({userID});
          return user;
        },
        createTodo: async(parent, args, context, info) => {
          const todo = new Todo({
            userID: args.userID,
            id: args.id,
            title: args.title,
            completed: args.completed
          });
          await todo.save();
          return todo;
        },
        updateTodo: async (_, { id, title, completed }) => {
            // Logic to update the todo in the database
            const todo = await Todo.findOneAndUpdate({id}, { title, completed }, { new: true });
            return todo;
        },
        deleteTodoByID: async (_, { id }) => {
            // Logic to delete the todo from the database
            const todo = await Todo.findOneAndDelete({id});
            return todo;
        }
      },
      Query: { 
        getUserByID: async(parent, args, context, info) => {
          return await User.findOne({userID: args.userID});
        },
        getUsers: async() => {
          return await User.find();
        },
        getTodoByID: async(parent, args, context, info) => {
          return await Todo.findOne({id: args.id});
        },
        getTodos: async() => {
          return await Todo.find();
        },
        todosByUserID: async (_, { userID }) => {
          try {
              const todos = await Todo.find({ userID });
              return todos;
          } catch (error) {
              throw new Error('Error fetching todos: ' + error.message);
          }
        }
      }
    }
  });

  app.use(cors());
  app.use(bodyParser.json());
  await server.start();
  app.use('/graphql', expressMiddleware(server));
  app.listen({port: 4000}, () => {
    console.log('Server ready at http://localhost:4000/graphql');
  });
}

startServer();