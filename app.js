const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const date = require(__dirname + "/date.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));

const items = ["Eat", "Shit", "Sleep", "Repeat"];
let workListItems = [];

app.get("/", function (req, res) {
  res.render("list", { listTitle: date.getDate(), newListItems: items });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workListItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.listen(3000, function () {
  console.log("Server is running");
});

app.get("/work", (req, res) => {
  res.render("list", { listTitle: "Work List", newListItems: workListItems });
});

app.post("/work", (req, res) => {
  const item = req.body.newItem;
  workListItems.push(item);
  res.redirect("/work");
});

app.get("/about", (req, res) => {
  res.render("about");
});
