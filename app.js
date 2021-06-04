require("dotenv").config();
const port = 3000;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const kill = require("kill-port");
const Client = require("coinbase").Client;

//  Commented as API KEY TAKES 48 HOURS TO ACTIVATE
const client = new Client({
  apiKey: "API_KEY",
  apiSecret: "API_SECRET",
  strictSSL: false
});

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

let price;

mongoose.connect("mongodb://localhost:27017/cryptDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = {
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
};

const User = new mongoose.model("User", userSchema);

//Home route
app
  .route("/home")
  .get((req, res) => {
  res.render("home");
  });

// Login route
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const enteredUsername = req.body.loginUsername;
    const enteredPassword = req.body.loginPassword;

    User.findOne({ username: enteredUsername }, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === enteredPassword) {
            res.redirect("track");
          }
        }
      }
    });
  });


//Track route
app.route("/track").get((req, res) => {


  //  SAMPLE GET REQUEST
  client.getBuyPrice({ 'currencyPair': 'BTC-INR' }, function (err, obj) {
    price = obj.data.amount;
    console.log('total amount: ' + obj.data.amount);
    res.render("track", { Price: price });

  });
});

//Register route
app
  .route("/register")
  .get((req, res) => {
    res.render("register");
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

app.listen(port, () => {
  // setTimeout(() => {
  //   kill(port, "tcp")
  console.log("Server started on port 3000");
  //     .catch(
  //       console.log("An interruption is caught ,unable to start the server")
  //     )
  // }, 1000)
});
