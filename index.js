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

/*
	Max - this is a really ugly way of handling user creation - just username, no password - but it works.
	The challenge here is - we need to make TWO database calls - one to check how many instances of this username
	exist in the database, and another to actually create the user IF no such user already exists. I spent hours trying
	to do this in one db function, and after I couldn't figure it out, decided to just brute-force it. This code will need
	to be refactored. 

	This is all done to properly redirect. Funny enough, Mongo has a simple built-in method to only insert if the username is unique (see notes in [db.js]signUp() )

	POST /signup --> [db.js] uniqueUser() --> [index.js] tryToSignUp() --> IF USER DOESN'T EXIST: [db.js]signUp() --> [index.js]confirmSignUp --> redirect back to index
																	   --> IF USER EXISTS: redirect back to sign up page 
*/


	app.get("/signup", function(req, res){
		res.render("account/signup")
	});

	app.post("/signup", function(req, res){
		
		db.uniqueUser(res, req.body, tryToSignUp);

	});

	function tryToSignUp(res, userCount, user){

		/* 
			this callback function is called from db.js signUp(). 'userCount' is a number. If the username already exits or is empty, 
			(result), we redirect back to the sign-up page. Otherwise, we call  [db.js]signUp() to actually create the user.

			As a next step, we'd want to flash a confirm/error message here.
		*/


		console.log("index - username supplied is " + user.username +" and is " + user.username.length + " characters long.");
		console.log("index - userCount is " + userCount);
		if(userCount>0 || user.username.length == 0){	// the user already exists in the database, we redirect back to the sign up page.
			console.log("index - sorry, the username '" + user.username + "' already exists or is empty");
			res.render("account/signup", { 'error' : "this username already exists or is empty" });		// !! - this allows us to pass back an error message.
		}else{
			db.signUp(res, user, confirmSignUp);
		}
	}

	function confirmSignUp(res, user){
		console.log("Successfully created user '" + user.username +"'");
		res.redirect("/");
	}


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


	app.get("/joingame", function(req, res){
		res.render("account/joingame")
	});

	app.get("/startgame", function(req, res){
		res.render("account/startgame")
	});

	app.get("/login", function(req, res){
		res.render("account/login")
	});

	app.get("/invite", function(req, res){
		res.render("account/invite")
	});




	/* ------- */

	// 404 page

	app.use(function(request, response) {
		response.status(404);
		response.send("File not found!");
	});

	app.listen(app.get("port"), function() {
		console.log("Server started on port " + app.get("port"));
	});