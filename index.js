/* dependencies */
	const http = require("http");
	const fs = require("fs");
	const path = require("path");
	const express = require("express");
	const MongoClient = require('mongodb').MongoClient

	const app = express();
	app.set("port", process.env.PORT || 3000)
	app.set("views", path.join(__dirname, "views"));		// tells us where our views are
	app.set("view engine", "ejs");							// tells us what view engine to use

/* processes */
	const games = require("./processes/games");				//pulls in functions from games.js
	const users = require("./processes/users");				//pulls in functions from users.js

/* routing */
	app.use(express.static(path.join(__dirname, "assets")));	//middleware for the assets folder (stylesheet, etc.)

	app.get("/", function(request, response) {
		response.render("index");							// this renders views/index.ejs when the user GETs "/"
	});

	app.get("/game/[A-Za-z0-9_]", function(request, response) { //the route is using a regex
		var players = [	//sample data - this would come from user input on the site

			/* So, we need to pull all the players from our database */

		/*	MongoClient.connect('mongodb://localhost:27017/', (err, database) => {
			  // ... start the server


			})

			MongoClient.connect('your-mongodb-url', (err, database) => {
			  if (err) return console.log(err)
			  db = database
			  app.listen(3000, () => {
			    console.log('listening on 3000')
			  })
			})*/





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
		console.log("ID: " + app.locals.id);
		app.locals.gameData = games.getGameData(app.locals.id) || games.generateGame(players);	//display game or make one if it doesn't exist - demo purposes - in reality, making a game would be a POST request
	
/* -------------- */
/* Max - trying to understand why there are 3 cities if we have 4 players. */
/* Got it - there are 3 teams, even though we have 4 player*/
		testArr = [];
		players.forEach(function(p){
			testArr.push(" " + p.name);
		});
		app.locals.playerNames = "Here are the " + players.length + " players: " + testArr;

/* -------------- */



		response.render("game");
	});

	app.get("/user/[A-Za-z0-9_]", function(request, response) {
		app.locals.id = path.basename(request.url, path.extname(request.url));
		app.locals.userData = users.getUserData(app.locals.id);
		response.render("user");
	});

	app.use(function(request, response) {
		response.status(404);
		response.send("File not found!");
	});

	app.listen(app.get("port"), function() {
		console.log("Server started on port " + app.get("port"));
	});