require("dotenv").config();
const port = 3000;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Client = require("coinbase").Client;
const passport = require("passport")
const session = require("express-session")
const passportLocalMongoose = require("passport-local-mongoose")


const client = new Client({
  apiKey: "API_KEY",
  apiSecret: "API_SECRET",
  strictSSL: false
});

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(express.json())

app.use(passport.initialize())

app.use(passport.session())

app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())

let price;


mongoose.connect("mongodb://localhost:27017/cryptDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
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
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Home route
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {

    const user = new User({
      username: req.body.username,
      password: req.body.password
    })

    req.login(user, (err) => {
      if (err) {
        console.log(err)
      }

      else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/track")
        })
      }
    })

  })



app.route("/track").get((req, res) => {
  if (req.isAuthenticated()) {
    client.getBuyPrice({ 'currencyPair': 'BTC-INR' }, function (err, obj) {
      price = obj.data.amount;
      console.log('total amount: ' + obj.data.amount);
      res.render("track", { Price: price });
    });
  }

  else {
    res.redirect("/login")
  }
})




//Register route
app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })

  .post((req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
      if (err) {
        console.log(err)
        res.redirect("register")
      }

      else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/track")

        })
      }
    })
  })

app.listen(port, () => {
  console.log("Server started on port 3000");
});
