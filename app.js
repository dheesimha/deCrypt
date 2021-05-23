//jshint esversion:6

const express = require("express");

const app = express();









app.listen(3000,function()
{
  console.log("Server has started on port 3000");
});



//Homepage.js
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

//End of Homepage.js
