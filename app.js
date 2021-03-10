const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");
mongoose.connect(
  "mongodb+srv://MongoUser:Test1234@cluster0.t1icl.mongodb.net/todolistDB?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const itemSchema = new mongoose.Schema({
  itemBody: String,
});

const Item = mongoose.model("item", itemSchema);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));

const defaultItems = [
  new Item({ itemBody: "Sleep" }),
  new Item({ itemBody: "Work" }),
  new Item({ itemBody: "Repeat" }),
];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

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
        listTitle: "Today",
        newListItems: results,
      });
    }
  });
});

app.post("/", function (req, res) {
  const itemText = req.body.newItem;
  const listName = req.body.list;

  item = new Item({ itemBody: itemText });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, async (err, foundList) => {
      foundList.items.push(item);
      await foundList.save();
      res.redirect("/" + listName);
    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, async (err, foundList) => {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      await list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  });
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
  const listName = req.body.listName;
  const itemId = req.body.checkbox;

  item = new Item({ itemBody: listName });

  if (listName === "Today") {
    Item.deleteOne({ _id: itemId }, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Item with id " + itemId + " was deleted successfully.");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});
