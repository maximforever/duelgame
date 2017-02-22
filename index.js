var express = require("express");
var path = require("path");
var http = require("http");
var fs = require("fs");

var app = express();

app.set("port", process.env.PORT || 3000)

app.set("views", path.join(__dirname, "views"));        // tells us where our views are
app.set("view engine", "ejs");                          // tells us what view engine to use


app.get("/", function(request, response){
    console.log("going to  '/' ");
    response.render("index");       // this renders views/index.ejs when the user GETs "/"
})


app.locals.arr = ["Max", "James", "Felicia"];




app.use(function(req, res){
    res.status(404);
    res.send("File not found!");
});


app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
})