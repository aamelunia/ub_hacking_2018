const path = require("path");
const router = require("express").Router();
const Session = require("../models/session");
const vision = require("@google-cloud/vision");
const fs = require("fs");

const client = new vision.ImageAnnotatorClient();
const fileName = "test4.png";

router.get("/", function(req, res) {
  res.render("landing");
});

router.get("/notes", (req, res) => {
  res.render("notecanvas");
});

router.get("/canvas/:id", (req, res) => {
  if (!req.session.nickname) {
    return res.redirect(`/canvas/${req.params.id}/nickname`);
  }
  res.render("canvas", { nickname: req.session.nickname });
});

router.get("/canvas/:id/nickname", (req, res) => {
  if (req.session.nickname) {
    return res.redirect(`/canvas/${req.params.id}`);
  }
  res.render("chooseNickname", { id: req.params.id });
});

router.post("/canvas/:id/nickname", (req, res) => {
  req.session.nickname = req.body.nickname;
  return res.redirect(`/canvas/${req.params.id}`);
});

router.post("/urlgenerator", (req, res) => {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return res.redirect(`/canvas/${text}`);
});

router.post("/detection", (req, res) => {
  const imgFile = req.body.imgFile.split(",")[1];
  const request = {
    image: {
      content: decodeURIComponent(imgFile)
    },
    feature: {
      languageHints: ["en-t-i0-handwrit"]
    }
  };
  client
    .textDetection(request)
    .then(results => {
      const detections = results[0].textAnnotations;
      var data = undefined;
      if (typeof detections[0] !== "undefined") {
        data = {
          detection: detections[0]["description"] + "="
        };
      } else {
        data = {
          detections: ""
        };
      }
      res
        .status(200)
        .send(JSON.stringify(data))
        .end();
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
});

// router.get("/download", (req, res) => {
//   var text = "Hello world!";
//   res.attachment("filename.txt");
//   res.type("txt");
//   res.send(text);
// });

// router.post("/imagetotext", (req, res) => {
//   console.log("HERE!");
//   var text = req.body.text;
//   text = text.substring(0, text.length - 2);
//   console.log(`Text: ${text}`);

// });

module.exports = router;
