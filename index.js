/* dependencies */
	const http = require("http");
	const fs = require("fs");								// file system
	const path = require("path");							// access paths
	const express = require("express");						// express
	const MongoClient = require('mongodb').MongoClient		// talk to mongo
	const bodyParser = require('body-parser')				// parse request body


	const app = express();
	app.set("port", process.env.PORT || 3000)
	app.set("views", path.join(__dirname, "views"));		// tells us where our views are
	app.set("view engine", "ejs");							// tells us what view engine to use

/* processes */
	const games = require("./processes/games");				//pulls in functions from games.js
	const users = require("./processes/users");				//pulls in functions from users.js
	const db = require("./processes/db");					//pulls in functions from users.js
	

/* middleware */

	app.use(function(request, response, next){					// logs request URL
		console.log("Request: " + request.method + " " + request.url);
		next();
	});

	app.use( bodyParser.json() );       					// to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({     					// to support URL-encoded bodies
	  extended: true
	}))

	app.use(express.static(path.join(__dirname, "assets")));	//middleware for the assets folder (stylesheet, etc.)


/* routing */
	

	app.get("/", function(request, response) {
		response.render("index");							// this renders views/index.ejs when the user GETs "/"
	});

	app.get("/game/[A-Za-z0-9_]*", function(request, response) { //the route is using a regex
		var players = [	//sample data - this would come from user input on the site

			{
				id: 1234,
				name: "maxim",
				team: 0
			},
			{
				id: 5678,
				name: "james",
				team: 3
			},
			{
				id: 9010,
				name: "jennifer",
				team: 2
			},
			{
				id: 1112,
				name: "elizabeth",
				team: 1
			}
		];

		app.locals.id = path.basename(request.url, path.extname(request.url)); //this gets the last section of a url and removes the file extension. for example: http://a.com/b/c.html => "c"
		app.locals.gameData = games.getGameData(app.locals.id) || games.generateGame(players);	//display game or make one if it doesn't exist - demo purposes - in reality, making a game would be a POST request
		games.updateGame(app.locals.gameData);
		response.render("game");
	});

	app.get("/user/[A-Za-z0-9_]*", function(request, response) {
		app.locals.id = path.basename(request.url, path.extname(request.url));
		app.locals.userData = users.getUserData(app.locals.id);
		response.render("user");
	});

	/* MAX - DB WORK HERE */

	app.get("/db", function(req, res){
		
		console.log("hey!");
		db.addUserToDatabase({name: "Rodrigo"});
		res.end();
	});

	app.get("/addUser", function(req, res){
		res.render("createUser");
		res.end();
	});

	app.post("/addUser", function(req, res){
		console.log("posting to /addUser")
		// 	console.log(req.body);
		db.addUserToDatabase(req.body)
		res.redirect('/allusers')
	});





	app.get("/allUsers", function(req, res){

		console.log("========= STARTING THE REQUEST ======");

		db.allUsers(res, renderUsers);
		console.log("this is still async");

		//console.log("data from database: " + allUsers);
	});

	function renderUsers(res, data){
		console.log("calling back");
		app.locals.allUsers = data;
		res.render("allUsers");
	}

	/* ------- */

		app.use(function(request, response) {
		response.status(404);
		response.send("File not found!");
	});

	app.listen(app.get("port"), function() {
		console.log("Server started on port " + app.get("port"));
	});