const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// Login route

app.route("/login").get((req, res) => {
  res.render("login");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
