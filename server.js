const express = require('express');
require('dotenv').config();

// constants
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const validate = require('validator');
const MONGO_URI = process.env.MONGO_URI;
const userModel = require("./models/userModel");
const bcrypt = require('bcrypt');
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);
const store = new mongoDbSession({
  uri: MONGO_URI,
  collection: "sessions",
})
const { isLoggedIn } = require("./middlewares/isLoggedIn");
const todoModel = require("./models/todoModel");
const rateLimit = require('./middlewares/rateLimiting');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//middleware to access ejs files
app.set("view engine", "ejs")
// middelware for login session creation 
app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: store // coming from connect-mongodb-session
}))
app.use(express.static("public"));


// MongoDB
// Connecting to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected")
  })
  .catch((err) => {
    console.log("Error occured connecting to MongoDB", err);
  })


// Routes
app.listen(PORT, (req, res) => {
  console.log(`Server running on port http://localhost:${PORT}`)
})

// landing page route
app.get("/", (req, res) => {
  return res.render("landing")
})

// signup page
app.get("/signup", (req, res) => {
  return res.render("signup")
})

// signup page submitted route
app.post("/signup", async (req, res) => {
  // extracting data coming from signup form
  const { username, name, password, email } = req.body;
  if (!username || !password || !email || !name) {
    return res.send({
      status: 400,
      message: "Credentials Missing"
    })
  }
  // Email validation
  if (!validate.isEmail(email)) {
    return res.send({
      status: 400,
      message: "Invalid email format"
    })
  }
  // HashPassword creation (not able to decode pass, when data leaked)
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT))
  const userObj = new userModel({
    name: name,
    user_name: username,
    email: email,
    password: hashedPassword,
  })

  try {
    // Saving user to DB
    const userDb = await userObj.save();
    res.redirect("/login")
  } catch (error) {
    return res.send({
      status: 500,
      message: "Error occured in DB",
      error: error
    })
  }
})

// login page
app.get("/login", (req, res) => {
  return res.render("login")
})

// login page route
app.post("/login", async (req, res) => {
  // extracting data coming from login form
  const { loginId, password } = req.body;
  if (!loginId || !password) {
    return res.send({
      status: 400,
      message: "Credentials Missing"
    })
  }
  let userDb = {};
  // checking whether user provided Email or UserName
  if (validate.isEmail(loginId)) {// if user provides email..
    userDb = await userModel.findOne({ email: loginId })
    if (!userDb) {
      return res.send({
        status: 500,
        message: "Email not exists"
      })
    }
  }
  else { // if user provides UserName
    userDb = await userModel.findOne({ user_name: loginId })
    if (!userDb) {
      return res.send({
        status: 500,
        message: "Username not exists"
      })
    }
  }

  // Creating Session 
  req.session.isLoggedIn = true;
  req.session.user = {
    user_name: userDb.user_name,
    email: userDb.email,
    userId: userDb._id
  }

  // checking password is correct or not using bcrypt compare to (hashed password)
  const passMatched = await bcrypt.compare(password, userDb.password)
  if (!passMatched) {
    return res.send({
      status: 400,
      message: "Wrong Password"
    })
  }
  else {
    return res.redirect("/todo_dashboard")
  }
})

// dashboard route
app.get("/todo_dashboard", isLoggedIn, async (req, res) => {
  res.render("todoPage");
})

// api to get all todos of logged user
app.get("/get_todo_dashboard", isLoggedIn, async (req, res) => {
  // getting userName from DB of (logged in user);
  const userName = req.session.user.user_name;
  try {
    // getting all todos of user from DB using .find method of (mongoose.model)
    let todos = await todoModel.find({ userName });
    return res.send({
      status: 200,
      data: todos
    })
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database Error",
      error: error,
    })
  }
})

// logout route
app.post("/logout", isLoggedIn, (req, res) => {
  // deleting session object from sessions DB
  req.session.destroy((error) => { // destroy is the function which deletes the entire session
    if (error) throw error;
    return res.redirect("/login")
  })
})

// api to logout from all devices 
const sessionSchema = new mongoose.Schema({ _id: String }, { strict: false });
const sessionModel = mongoose.model("session", sessionSchema);
app.post("/logout_from_all", isLoggedIn, async (req, res) => {
  // creating schema to retrive data feom session DB

  // getting username of user who logged in
  const userName = req.session.user.user_name
  try {
    // using deleteMany method to delete all sessions with same userName
    const devicesLoggedout = await sessionModel.deleteMany({
      "session.user.user_name": userName,
    })
    //redirecting to login page from all logged in accounts
    return res.redirect("/login");
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error
    })
  }
})

// api to add (todo) into DB
app.post("/add_todo", isLoggedIn, rateLimit, async (req, res) => {
  // getting todo input from Client
  const { todoitem } = req.body;

  // creating object of todo to add to DB
  const todoItem = new todoModel({
    todo: todoitem,
    userName: req.session.user.user_name
  })
  // adding to todos collection in DB
  const todoDb = await todoItem.save();
  return res.send({
    status: 201,
    message : "Todo Added"
  })
})

// api to edit todo
app.post("/edit_todo", isLoggedIn, async (req, res) => {
  const loggedUser = req.session.user.user_name;
  const { id, newText } = req.body
  if (!newText) {
    return res.send({
      status: 400,
      message: "Not Updated present todo"
    })
  }
  if (newText.length < 3 || newText.length > 30) {
    return res.send({
      status: 400,
      message: "Text should be from 3-30 characters"
    })
  }
  // Getting username from todoDB
  const user = await todoModel.findOne({ _id: id });
  const username = user.userName
  // checking whether logged user and username are equal 
  if (username !== loggedUser) {
    return res.send({
      status: 400,
      message: "Not able to edit, you are not owner of this account"
    })
  }
  try {
    // getting todo fro DB and updating with newText
    const presentTodo = await todoModel.findOneAndUpdate({ _id: id }, { todo: newText })
    return res.send({
      status: 200,
      message: "Your todo is Updated",
      data: presentTodo
    })
  } catch (error) {
    return res.send({
      status: 500,
      messsage: "Database error",
      error
    })
  }
})

// api to delete Todo
app.post("/delete_todo", isLoggedIn, async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.send({
      status: 400,
      message: "Cannot get todo item (id not provided)",
    })
  }
  // getting userDb
  const user = await todoModel.findOne({ _id: id })
  // getting user from session (currently loggedin user)
  const loggedUser = req.session.user.user_name;
  if ((user.userName !== loggedUser)) {
    return res.send({
      status: 400,
      message: "You can't delete this todo,You are not authorized",
    })
  }
  try {
    const deletedTodo = await todoModel.findOneAndDelete({ _id: id });
    return res.send({
      status: 200,
      message: "Todo item deleted"
    })

  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error
    })
  }
})

// pagination
app.get(`/pagination-dashboard`, isLoggedIn, async (req, res) => {
  const SKIP = req.query.skip;
  const username = req.session.user.user_name;

  try {
    const todos = await todoModel.aggregate([
      {
        $match: { userName: username }
      },
      {
        $facet: {
          data: [{ $skip: parseInt(SKIP) }, { $limit: parseInt(process.env.LIMIT) }],
        }
      }
    ])
    // console.log("todos------>",todos[0].data);
    return res.send({
      status: 201,
      message: "Fetch success",
      data: todos[0].data
    })
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database Error",
      error
    })
  }
})