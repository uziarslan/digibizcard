if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
//models will go here
require("./models/admin");
require("./models/user");
require("./models/organization");
require("./models/notification");
const Message = require("./models/messages");

const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const MongoDBStore = require("connect-mongo");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const path = require("path");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const bodyParser = require("body-parser");
const apiRoutes = require("./utils/apiRoutes");
const Admin = mongoose.model("Admin");
const User = mongoose.model("User");
const Organization = mongoose.model("Organization");
const Notification = mongoose.model("Notification");

const userSockets = {};
const userStatus = {};

function broadcastStatus(userId, status) {
  Object.keys(userSockets).forEach((id) => {
    userSockets[id].forEach((socket) => {
      io.emit("userStatusChanged", { userId, status });
    });
  });
}

io.on("connection", (socket) => {
  socket.on("registerUser", async (userId) => {
    if (!userSockets[userId]) {
      userSockets[userId] = [];
    }
    userSockets[userId].push(socket);
    userStatus[userId] = "online";
    broadcastStatus(userId, "online");

    // Emit undelivered messages to the user upon reconnection
    const undeliveredMessages = await Message.find({
      recipient: userId,
      "messages.delivered": false
    });
    undeliveredMessages.forEach(async (message) => {
      message.messages.forEach(async (msg) => {
        if (!msg.delivered) {
          io.emit("receiveMessage", {
            content: msg.content,
            senderId: message.sender,
            messageId: msg._id,
          });
          msg.delivered = true; // Mark the message as delivered
        }
      });
      await message.save();
    });

    socket.on("disconnect", () => {
      userSockets[userId] = userSockets[userId].filter(s => s !== socket);
      if (userSockets[userId].length === 0) {
        delete userSockets[userId];
        userStatus[userId] = "offline";
        broadcastStatus(userId, "offline");
      }
    });
  });

  socket.on("sendMessage", async ({ senderId, recipientId, content }) => {
    try {
      // Save message to database
      const messageData = {
        sender: senderId,
        recipient: recipientId,
        messages: [{ content, delivered: false }]
      };
      const newMessage = await Message.create(messageData);

      let senderName = await getSenderName(senderId);

      if (userSockets[recipientId] && userSockets[recipientId].length > 0) {
        userSockets[recipientId].forEach(async (clientSocket) => {
          io.emit("receiveMessage", {
            content,
            senderId,
            messageId: newMessage._id,
          });
          newMessage.messages[0].delivered = true; // Mark as delivered since it's being sent
          await newMessage.save();

          clientSocket.emit("notification", {
            message: `You have received a message from ${senderName}`,
            date: new Date(),
            url: `/chat/${senderId}`,
          });
        });
      } else {
        console.log(`Recipient ${recipientId} is offline; message stored but not yet delivered.`);
      }

      await saveNotification(recipientId, senderName);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageSent", { status: "error", error: error.message });
    }
  });
});

async function getSenderName(senderId) {
  let senderName;
  const organization = await Organization.findById(senderId);
  if (organization) {
    senderName = organization.orgName;
  } else {
    const user = await User.findById(senderId);
    if (user) {
      senderName = `${user.firstName} ${user.lastName}`;
    }
  }
  return senderName || "an unknown sender";
}

async function saveNotification(recipientId, senderName) {
  const notification = new Notification({
    userId: recipientId,
    message: `You have received a message from ${senderName}`,
  });
  await notification.save();
}


// Make userSockets accessible in your route handlers
app.use((req, res, next) => {
  req.userSockets = userSockets;
  next();
});

const PORT = 3000;
const mongoURi = process.env.MONGO_URI;
const secret = "hireddd";

const touchAfterSixMonths = 6 * 30 * 24 * 60 * 60;

const store = new MongoDBStore({
  mongoUrl: mongoURi,
  secret,
  touchAfter: touchAfterSixMonths,
});
const sessionConfig = {
  store,
  secret,
  name: "session",
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: touchAfterSixMonths * 1000, // Convert seconds to milliseconds
  },
  resave: false,
  saveUninitialized: false,
};

// Setting up the app
app.engine("ejs", ejsMate);

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

app.set(path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(session(sessionConfig));

app.use(passport.initialize());

app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

passport.use("admin", new localStrategy(Admin.authenticate()));
passport.use("user", new localStrategy(User.authenticate()));
passport.use("organization", new localStrategy(Organization.authenticate()));
passport.serializeUser((user, done) => {
  if (user instanceof User) {
    done(null, { type: "user", id: user.id });
  } else if (user instanceof Admin) {
    done(null, { type: "admin", id: user.id });
  } else if (user instanceof Organization) {
    done(null, { type: "organization", id: user.id });
  }
});
passport.deserializeUser(async (data, done) => {
  try {
    let user;
    if (data.type === "user") {
      user = await User.findById(data.id);
    } else if (data.type === "admin") {
      user = await Admin.findById(data.id);
    } else if (data.type === "organization") {
      user = await Organization.findById(data.id);
    }

    // Save the user object in the session regardless of its type
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// initializing Mongoose
mongoose
  .connect(mongoURi, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {})
  .catch((e) => {
    console.log(e);
  });

const db = mongoose.connection;

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(express.json());

//Routes usage will go here
app.use(apiRoutes);

// Listen for the port Number
http.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});

module.exports = { io };
