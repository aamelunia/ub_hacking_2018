var socket;
function setup() {
  var canvas =createCanvas(1080, 1080);
  canvas.parent("canvas");
  background(51);
  socket = io.connect("http://localhost:3001");

  var link = document.createElement('a');
  link.innerHTML = 'download image';
  link.addEventListener('click', function(ev) {
    link.href = canvas.toDataURL();
    link.download = "mypainting.png";
  }, false);
  document.body.appendChild(link);
}

function newDrawing(data) {
  //noStroke();
  stroke(255, 0, 100); //colors
  line(data.x, data.y, data.px, data.py);
  strokeWeight(10);

  var link = document.createElement('a');
  link.innerHTML = 'download image';
  link.addEventListener('click', function(ev) {
    link.href = canvas.toDataURL();
    link.download = "mypainting.png";
  }, false);
  document.body.appendChild(link);
}

function mouseDragged() {
  console.log(mouseX + " " + mouseY);

  var data = {
    x: mouseX,
    y: mouseY,
    px: pmouseX,
    py: pmouseY
  };
  socket.emit("mouse", data);

  //noStroke();
  stroke(255);
  line(mouseX, mouseY, pmouseX, pmouseY);
  strokeWeight(10);
}
function draw() {}
