//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-joram:test123@cluster0.zrz8i.mongodb.net/todolistDB", { useNewUrlParser: true }); //create database
const itemSchema = new mongoose.Schema({  //define schema
  name: String
});

const Item = mongoose.model("Item", itemSchema); //create model


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = new mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({},function (err, items) { //return a array item back (find all)
 
       res.render("list", {listTitle: "Today", newListItems: items});
    
})

});

app.get("/:customListName", function (req, res) { 
  const customListName = _.capitalize(req.params.customListName); //get the name of the custom name and only convert the first alphabet to upper letter

  List.findOne({ name: customListName }, function (err, foundList) { //"findOne" return single object only
    if (!err) {
      if (!foundList) { //if there is no list returns
       
        //create a new list
        const newList = new List({
          name: customListName
        });
      
        newList.save();
        res.redirect("/" + customListName);
      } else {
        //show the existing list
        res.render("list", { listTitle: foundList.name , newListItems: foundList.items });
      }
    } else {
      console.log(err);
    }
  });
  

});

app.post("/", function (req, res) {
  //to differentiate the list
  const listName = req.body.list; 
  //get the item added
  const itemName = req.body.newItem; 

  const newItem = new Item({
    name: itemName
  });
  
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
    
  } else {

    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(newItem);//Push the new object into the array of item
      foundList.save();
      res.redirect("/" + listName);
    });

  }

 
   
 
});



app.post("/delete", function (req, res) {   //the post="/delete" in the form will post data to here
  
  const itemID = req.body.checked; //the "value: _id"  is assigned to the "name: "checked" "
  const listName = req.body.listName;
  
  if (listName === "Today") {
     
    Item.findByIdAndRemove(itemID, function (err) { //remove item by their _id
      if (!err) {
        console.log("deleted successfully");
      }
    });
  
    res.redirect("/"); //after completed, it will redirect back "/"
    
  } else {

    const condition = { name: listName };
    const update = { $pull: { items: { _id: itemID } } };

    List.findOneAndUpdate( condition , update , function (err, result) {
      if (!err) {
        console.log(result);
        res.redirect("/" + listName);
       }
    });

   
  }
 
});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}


app.listen(port, function() {
  console.log("Server has started successfully");
});
