const express = require("express"),
  http = require("http"),
  session = require("express-session"),
  bodyParser = require("body-parser"),
  socketIo = require("socket.io"),
  path = require("path"),
  fs = require("fs"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  indexRoutes = require("./routes/index"),
  Session = require("./models/session");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.Promise = global.Promise;

//initial connection to database
//Add your database connection string here
const databaseUri =
  "";
mongoose
  .connect(
    databaseUri,
    { useNewUrlParser: true }
  )
  .then(() => console.log(`Database connected`))
  .catch(err => console.log(`Database connection error: ${err.message}`));

app.set("view engine", "ejs");
app.engine("html", function(path, options, callbacks) {
  fs.readFile(path, "utf-8", callback);
});

app.use(express.static(path.join(__dirname)));
app.use(express.static("views"));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: false
    // cookie: { path: "/", secure: false, maxAge: 20000 }
  })
);

app.set("view engine", "ejs");

app.use("/", indexRoutes);

io.on("connection", socket => {
  socket.on("room", connection => {
    Session.findById(connection.id, function(err, session) {
      if (!err) {
        if (session) {
          session.users = session.users + 1;
          socket.emit("on_page_load_users", session.nicknames);
          socket.emit("on_page_load_image", session.coordinates);
          socket.emit("on_page_load_messages", session.messages);
          session.nicknames.push(connection.nickname);
          session.save();
        } else {
          var new_session = new Session({
            _id: connection.id,
            nicknames: [connection.nickname]
          });
          new_session.save();
        }
      }

      socket.join(connection.id);
      socket.room = connection.id;
      socket.nickname = connection.nickname;
      socket.in(connection.id).emit("new_joiner", connection.nickname);
    });
  });

  socket.on("message", msg => {
    Session.findById(socket.room, function(err, session) {
      if (!err) {
        if (!session) {
        } else {
          session.messages.push({
            from: socket.nickname,
            message: msg
          });
          session.save();
        }
      }
    });
    socket.in(socket.room).emit("message", {
      from: socket.nickname,
      message: msg
    });
  });

  socket.on("mouse", connection => {
    Session.findById(connection.id, function(err, session) {
      if (!err) {
        if (!session) {
        } else {
          session.coordinates.push(connection.p5);
          session.save();
        }
      }
    });
    socket.in(connection.id).emit("mouse", connection.p5);
  });

  socket.on("disconnect", () => {
    Session.findById(socket.room, function(err, session) {
      if (!err) {
        if (!session) {
        } else {
          session.users = session.users - 1;
          var index = session.nicknames.indexOf(socket.nickname);
          session.nicknames.splice(index, 1);
          if (session.users == 0) {
            session.delete();
          } else {
            socket.in(socket.room).emit("user_left", socket.nickname);
            session.save();
          }
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT);
