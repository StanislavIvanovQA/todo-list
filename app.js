const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemSchema = new mongoose.Schema({
  itemBody: String,
});

const Item = mongoose.model("item", itemSchema);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));

const defaultItems = [
  new Item({ itemBody: "Eat" }),
  new Item({ itemBody: "Shit" }),
  new Item({ itemBody: "Sleep" }),
  new Item({ itemBody: "Repeat" }),
];

let workListItems = [];

app.get("/", function (req, res) {
  Item.find({}, (err, results) => {
    if (results.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Default values added.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: date.getDate(),
        newListItems: results,
      });
    }
  });
});

app.post("/", function (req, res) {
  const itemText = req.body.newItem;

  if (req.body.list === "Work") {
    new Item({ itemBody: itemText }).save();
    res.redirect("/work");
  } else {
    new Item({ itemBody: itemText }).save();
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

app.post("/delete", function (req, res) {
  itemId = req.body.checkbox;
  Item.deleteOne({ _id: itemId }, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Item with id " + itemId + " was deleted successfully.");
    }
  });

  res.redirect("/");
});
