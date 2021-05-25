const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/cryptDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = {
  username: String,
  email: String,
  password: String,
};

const User = new mongoose.model("User", userSchema);

// Home route
app
  .route("/home")
  .get((req, res) => {
    res.render("track");
  })
  .post((req, res) => {
    const newUser = new User({
      username: req.body.registerUsername,
      email: req.body.registerEmail,
      password: req.body.registerPassword,
    });

    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("track");
      }
    });
  });

//Track route
app.route("/track").get((req, res) => {
  res.render("track");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
