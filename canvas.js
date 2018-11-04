// var socket = io.connect("http://localhost:3001");
var socket = io.connect("/");
var urlArray = window.location.href.split("/");
socket.on("on_page_load_users", loadPageUsers);
socket.on("on_page_load_messages", loadPageMessages);

var users = [];
var msgs = [];

function setup() {
  var canvas = createCanvas(750, 600);
  canvas.parent("canvas");
  background("white");
  socket.on("mouse", newDrawing);
  socket.on("on_page_load_image", loadPageImage);
  socket.on("new_joiner", newJoiner);
  socket.on("user_left", userLeft);
  socket.on("message", addNewMessage);

  var button = document.getElementById("btn-download");
  button.addEventListener("click", function(e) {
    var canvas = document.getElementsByTagName("canvas")[0];
    var dataURL = canvas.toDataURL("image/png");
    button.href = dataURL;
  });
}

function updateUserList() {
  document.getElementById("userList").innerHTML = "";
  for (var i = 0; i < users.length; i++) {
    var node = document.createElement("p");
    node.classList.add("nameParagraph");
    var hr = document.createElement("hr");
    hr.classList.add("nameParagraphUnderline");
    var textnode = document.createTextNode(users[i]);
    node.appendChild(textnode);
    document.getElementById("userList").appendChild(node);
    document.getElementById("userList").appendChild(hr);
  }
}

function sendNicknameAndRoom(data) {
  var nickname = String(data).replace(/\s/g, "");
  socket.emit("room", {
    id: String(urlArray[urlArray.length - 1]),
    nickname: nickname
  });
  users.push(nickname);
  console.log(users);
  updateUserList();
}

function newJoiner(data) {
  users.push(data);
  console.log(users);
  updateUserList();
}

function userLeft(data) {
  var index = users.indexOf(socket.nickname);
  users.splice(index, 1);
  console.log(users);
  updateUserList();
}

function newDrawing(data) {
  //noStroke();
  stroke(255, 0, 100); //colors
  line(data.x, data.y, data.px, data.py);
  strokeWeight(10);
}

function loadPageImage(data) {
  for (var item of data) {
    newDrawing(item);
  }
}

function loadPageUsers(data) {
  for (var item of data) {
    users.push(item);
  }
  console.log(users);
  updateUserList();
}

function mouseDragged() {
  var data = {
    x: mouseX,
    y: mouseY,
    px: pmouseX,
    py: pmouseY
  };
  var content = {
    id: String(urlArray[urlArray.length - 1]),
    p5: data
  };
  socket.emit("mouse", content);

  //noStroke();
  stroke("black");
  line(mouseX, mouseY, pmouseX, pmouseY);
  strokeWeight(10);
}
// function draw() {}

function addNewMessage(data) {
  // msgs.push(data);
  updateMessages(data.from,data.message)
  // console.log(msgs);
}

function loadPageMessages(arr) {
  // for (var item of arr) {
  //   msgs.push(item);
  // }
  // console.log(msgs);
  for(var item of arr){
    updateMessages(item.from,item.message)
  }
}

function updateMessages(from, msg) {

  document.getElementById('useless').innerText = ""
  var messages = document.getElementById('messages')
  var message_paragraph = document.createElement("p");
  if (from == "You") {
    message_paragraph.classList.add("messageParagraph");
  } else {
    message_paragraph.classList.add("message_paragraph");
  }
  var textnode = document.createTextNode(from + ': ' + msg);
  message_paragraph.appendChild(textnode);
  messages.appendChild(message_paragraph);
}


function sendMessage() {
  var msg = document.getElementById("userMessage").value;
  document.getElementById("userMessage").value = "";
  socket.emit("message", msg);
  msgs.push({
    from: "You",
    message: msg
  });
  console.log(msgs);

  updateMessages("You", msg)

}
