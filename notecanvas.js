var strokeColor = "black"

function setup() {
  var canvas = createCanvas(750, 600);
  canvas.parent("canvas");
  background("white");

  var button = document.getElementById("btn-download");
  button.addEventListener("click", function(e) {
    var canvas = document.getElementsByTagName("canvas")[0];
    var dataURL = canvas.toDataURL("image/png");
    button.href = dataURL;
  });
}

function newDrawing(data) {

  let color = document.getElementById('colorPicker').value
  stroke(color); //colors
  line(data.x, data.y, data.px, data.py);

  var slider = document.getElementById("myRange");
  strokeWeight(slider.value/5);

  slider.oninput = function() {
    strokeWeight(this.value/5);
  }
}

function mouseDragged() {
  var data = {
    x: mouseX,
    y: mouseY,
    px: pmouseX,
    py: pmouseY
  };

  let color = document.getElementById('colorPicker').value
  stroke(color); //colors

  line(mouseX, mouseY, pmouseX, pmouseY);
  var slider = document.getElementById("myRange");
  strokeWeight(slider.value/5);

  slider.oninput = function() {
    strokeWeight(this.value/5);
  }
}

function download(text) {
  var element = document.createElement("a");
  console.log(text);
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", "parsedImage");

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function erase() {
  strokeColor = "white";
  stroke(strokeColor)
  document.getElementById('colorPicker').value = "#FFFFFF"
}

function brush() {
  strokeColor = "black";
  stroke(strokeColor)
}

function getImageText() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var obj = JSON.parse(this.responseText);
      console.log(obj);
      //   console.log(obj.detection.length);
      if (obj.detection) {
        var text = obj.detection;
        text = text.substring(0, text.length - 2);
        download(text);
      } else {
        console.log("fail");
        alert("Sorry, Google was unable to parse your image");
      }
      //   getContentAndOutputFile();
      //   xhttp.open("POST", window.location.origin + "/imagetotext", true);
      //   xhttp.setRequestHeader(
      //     "Content-Type",
      //     "application/x-www-form-urlencoded"
      //   );
      //   xhttp.send(`text=${obj.detection}`);
    }
  };
  xhttp.open("POST", window.location.origin + "/detection", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  encodeURIComponent(canvas.toDataURL());
  xhttp.send("imgFile=" + encodeURIComponent(canvas.toDataURL()));
}
