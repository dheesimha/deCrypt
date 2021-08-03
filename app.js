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
const findOrCreate = require("mongoose-findorcreate");
const { response } = require("express");

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


// const uri = `mongodb+srv://${process.env.MONGODB_ADMIN}:${process.env.MONGODB_PASSWORD}@cluster0.rrc0r.mongodb.net/cryptDB?retryWrites=true&w=majority`

const uri = `mongodb+srv://${process.env.MONGODB_ADMIN}:${process.env.MONGODB_PASSWORD}@cluster0.rrc0r.mongodb.net/cryptDB?retryWrites=true&w=majority`


mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

  .then(() => {
    console.log("Connected to the cloud");
  })

  .catch((err) => {
    console.log(err);
  })

// mongoose.connect("mongodb://localhost:27017/cryptDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.set("useCreateIndex", true);

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
    type: [String],
  }


});


userSchema.plugin(passportLocalMongoose, {
  usernameField: "username"
});

userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);



// This code is working to store data in the database

// const dhee = new User({
//   username: "Dheemanth",
//   email: "dhee@gmail.com,
//   password: "1234",
//   coins: ["Bitcoin", "Ethereum"]

// })

// dhee.save();

passport.use(User.createStrategy())


passport.serializeUser(function (user, done) {
  done(null, user);
});

// passport.deserializeUser(function (user, done) {
//   done(null, user);
// });

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
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
let coinPrice = [];

app.route("/").get((req, res) => {
  res.render("home");
})



//Register route
app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })

  .post((req, res) => {

    const username = req.body.username
    const password = req.body.password

    User.register({ username: username, provider: "local" }, password, (err, user) => {
      if (err) {
        console.log(err)
        res.redirect("/register")
      }

      else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/login")

        })
      }
    })
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
      password: req.body.password,
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
  "Binance Coin": "BNB",
  "Dogecoin": "DOGE",
  "XRP": "XRP",
  "Polygon": "MATIC",
  "Polkadot": "DOT",
  "Litecoin": "LTC",
  "Bitcoin Cash": "BCH",
  "Chainlink": "LINK"
}

// let allTheUserCoins;
// let authenticatedUserId;
// if (req.isAuthenticated()) {
//   authenticatedUserId = req.user.id;
//   User.findById(authenticatedUserId, (err, user) => {
//     if (err) {
//       console.log(err);
//     }

//     else {
//       allTheUserCoins = user.coins
//       console.log(allTheUserCoins + " All the usercoins");
//     }
//   })

// }


app.route("/track")
  .get((req, res) => {
    if (req.isAuthenticated()) {

      const trackUserName = _.capitalize(req.user.username)

      User.findById(req.user.id, (err, user) => {
        if (err) {
          console.log(err);
          // return;
        }

        else {
          // console.log(req.user)
          let coinList = user.coins

          console.log(coinList + " from get");

          // return coinList
          // req.user.coins.forEach((coin) => {
          // let coinTickerSymbol = tickerSymbol[coin]
          // client.getBuyPrice({ 'currencyPair': `${coinTickerSymbol}-INR` }, function (err, obj) {
          //   price = obj.data.amount;
          //   coinPrice.push(price);
          //   console.log(coin + " = " + price);
          //   console.log(coinPrice);

          // })
          // })

          // console.log(coinsCurrentPrice);
          res.render("track", { Coins: coinList, TrackUserName: trackUserName });
          // location.reload();
          // coinPrice = [];
        }
      })

      // console.log(coins + " from function return");


    }

    else {
      res.redirect("/login")
    }
  })


  .post((req, res) => {
    const addedCoins = req.body.selectedCoin
    const trackUserName = _.capitalize(req.user.username)


    const coinTickerSymbol = tickerSymbol[addedCoins]



    User.findByIdAndUpdate(req.user.id, { $addToSet: { coins: addedCoins } }, (err) => {
      if (err) {
        console.log(err);
      }
      else {
        const trackUserName = _.capitalize(req.user.username)
      }
    }
    )

    res.render("track", { Coins: req.user.coins, TrackUserName: trackUserName })

    // location.reload(true)

  })

  .delete((req, res) => {
    const trackUserName = _.capitalize(req.user.username)
    // console.log(req.body.name + " was deleted");

    User.findByIdAndUpdate(req.user.id, { $pull: { coins: req.body.name } }, (err) => {
      if (err) {
        console.log(err)
      }

      else {
        console.log(req.body.name + " was deleted");


      }


    }
    )




  })

// .post((req, res) => {
//   const addedCoins = req.body.selectedCoin

//   // console.log(coinList + " from post");

//   console.log(addedCoins)
//   const coinTickerSymbol = tickerSymbol[addedCoins]
//   console.log(coinTickerSymbol)



//   client.getBuyPrice({ 'currencyPair': `${coinTickerSymbol}-INR` }, function (err, obj) {
//     price = obj.data.amount;

//     console.log('total amount: ' + obj.data.amount);

//     User.findByIdAndUpdate(req.user.id, { $addToSet: { coins: addedCoins } }, (err) => {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         const trackUserName = _.capitalize(req.user.username)

//         // coins.forEach((coin) => {
//         //   console.log(coin);
//         // })
//         // console.log(coins);
//         // usersCoins.forEach((userCoin) => {
//         //   if (userCoin !== addedCoins) {
//         //     usersCoins.push(addedCoins)

//         //   }
//         // })

//         // usersCoins.push(addedCoins)

//         // console.log(usersCoins + " from Usercoins");

//         let coinsCurrentPrice = req.user.coins.forEach((coin) => {
//           let coinTickerSymbol = tickerSymbol[coin]
//           client.getBuyPrice({ 'currencyPair': `${coinTickerSymbol}-INR` }, function (err, obj) {
//             price = obj.data.amount;

//           })
//         })

//         console.log(coinsCurrentPrice);


//         res.render("track", { Coins: req.user.coins, TrackUserName: trackUserName });
//         // window.location.reload();

//       }

//       console.log(addedCoins + " is successfuly inserted" + " " + req.user.coins);
//     })




//   }

//   )




// })


app.get("/Bitcoin", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("../public/coins/source/Bitcoin")
  }

  else {
    res.redirect("/login")
  }
})

app.get("/Dogecoin", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("../public/coins/source/Dogecoin")
  }

  else {
    res.redirect("/login")
  }
})

app.get("/Ethereum", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("../public/coins/source/Ethereum")
  }

  else {
    res.redirect("/login")
  }
})

app.get("/Cardano", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("../public/coins/source/Cardano")
  }

  else {
    res.redirect("/login")
  }

})

app.get("/Polygon", (req, res) => {
  res.render("../public/coins/source/Polygon")

})

app.get("/Polkadot", (req, res) => {
  res.render("../public/coins/source/Polkadot")

})

app.get("/XRP", (req, res) => {
  res.render("../public/coins/source/XRP")

})

app.get("/Chainlink", (req, res) => {
  res.render("../public/coins/source/Chainlink")

})

app.get("/Litecoin", (req, res) => {
  res.render("../public/coins/source/Litecoin")

})




app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/")
})

app.listen(port, () => {
  console.log("Server started on port 3000");
});



// console.log(tickerSymbol.Bitcoin)


