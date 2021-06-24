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
const _ = require("lodash");
const LocalStrategy = require('passport-local').Strategy;

const client = new Client({
  apiKey: "API_KEY",
  apiSecret: "API_SECRET",
  strictSSL: false
});

const app = express();


app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false,
}))

app.use(passport.initialize())

app.use(passport.session())


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));


let price;
let coins = [];



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

  },

  password: {
    type: String,

  },

  coins:
  {
    type: [String]
  }


});


userSchema.plugin(passportLocalMongoose);


userSchema.pre("save", (next) => {
  if (this.password === password) {
    next();
  }
})

const User = new mongoose.model("User", userSchema);



app.route("/").get((req, res) => {
  res.render("home");
})


// Login route
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


// Track route

let tickerSymbol = {
  "Bitcoin": "BTC",
  "Ethereum": "ETH",
  "Cardano": "ADA",
  "Tether": "USDT",
  "Binance Coin": "BNB",
  "Dogecoin": "DOGE",
  "XRP": "XRP",
  "Polygon": "MATIC",
  "Polkadot": "DOT",
  "Litecoin": "LTC",
  "Bitcoin Cash": "BCH",
  "Chainlink": "LINK"
}

app.route("/track")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      client.getBuyPrice({ 'currencyPair': 'BTC-INR' }, function (err, obj) {
        price = obj.data.amount;

        console.log('total amount: ' + obj.data.amount);

        // Prints the username of the authenticated user
        // console.log(req.user.username)

        const trackUserName = _.capitalize(req.user.username)

        res.render("track", { Price: price, TrackUserName: trackUserName });
      });
    }

    else {
      res.redirect("/login")
    }
  })

  .post((req, res) => {
    const addedCoins = req.body.selectedCoin

    console.log(addedCoins)
    const coinTickerSymbol = tickerSymbol[addedCoins]
    console.log(coinTickerSymbol)



    client.getBuyPrice({ 'currencyPair': `${coinTickerSymbol}-INR` }, function (err, obj) {
      price = obj.data.amount;

      console.log('total amount: ' + obj.data.amount);
    })



    User.findById(req.user.id, (err, foundUser) => {
      if (err) {
        console.log(err)
      }

      else {
        if (foundUser) {
          console.log("Adding coin to the array")
          foundUser.coins.push(addedCoins)
          foundUser.save(done);
        }

        console.log(req.user)

      }
    })
  }
  )



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
          res.redirect("/login")

        })
      }
    })
  })

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/")
})

app.listen(port, () => {
  console.log("Server started on port 3000");
});



// console.log(tickerSymbol.Bitcoin)

