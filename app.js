const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config();

const app = express();

const dates = require(__dirname+"/date.js")

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine" , "ejs");
app.use(express.static("public"));

mongoose.connect(process.env.DBURL,  {useNewUrlParser: true, useUnifiedTopology: true });
const itemSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true
    }
});

const listSchema = {
    name : {
        type : String, 
        required : true
    } , 
    items : [itemSchema]
};

const items = new mongoose.model("Item" , itemSchema);
const lists = new mongoose.model("List" , listSchema);

const code = new items({
    name : "This" 
});

const learn = new items({
    name : "is" 
});
const bugs = new items({
    name : "TO DO LIST" 
});

const defaultItems = [code , learn , bugs];

app.get("/" , (req , res)=>{

    items.find((err , foundItems)=>{
        if(foundItems.length == 0) {

            items.insertMany(defaultItems , (err)=>{
                if(err) {
                    console.log(err);
                } else {
                    console.log("Successfully inserted");
                }
            });
            
            res.redirect("/");
        } else {
            res.render("list" , {day: dates.getDay() ,items : foundItems});
        }
    });
});

app.get("/:customListName" , (req , res)=>{
    const customListName = _.capitalize(req.params.customListName);
    console.log(customListName);
    if(customListName.includes("favicon.ico")) {
        return
    }
    lists.findOne({name : customListName} , (err , foundList)=>{
        console.log("find ke ansaer");
        if(!err) {
            if(!foundList) {
                // item nhi mila
                const newList = new lists({
                    name : customListName , 
                    items : defaultItems
                });
                newList.save()
                res.redirect(`/${customListName}`);
            } else {
                // item mila
                res.render("list" , {day : customListName , items : foundList.items});
            }
        }
    });
});

app.post("/" , (req , res)=>{
    const newItem = req.body["new-entry"];
    const listTitle = req.body.submit;

    console.log(req.body);

    const newEntry = new items({
        name : newItem
    });
    if(listTitle == dates.getDay()) {
        newEntry.save();
        res.redirect("/");
    } else {
        lists.findOne({name : listTitle} , (err , foundList)=>{
            if(!err) {
                foundList.items.push(newEntry);
                foundList.save();
                res.redirect(`/${listTitle}`);
            }
        });
    }

});

app.post("/delete" , (req , res)=>{
    const listName = req.body.listName;

    if(listName === dates.getDay()) {
        items.deleteOne({_id : req.body.checkbox} , (err)=>{
            if(err) {
                console.log(err);
            } else {
                console.log("Deleted Successfully");
                res.redirect("/");
            }
        });
    } else {
        lists.findOneAndUpdate({name : listName} ,{$pull : { items : {_id : req.body.checkbox}}}, (err , foundList)=>{
            if(!err) {
                res.redirect(`/${listName}`);
            }
        });
    }
    
});

app.listen(2000 , ()=>{
    console.log("Server started on port 2000");
});

