/* generateGame */
	function generateGame(players) {
		//empty gameData object
			var gameData = {};
			gameData.startTimestamp = new Date().getTime(); //add time that this game begins

		//teams
			var teams = [];	//this will inform how many different civilizations there are. maybe one per player, maybe not
			for (var i = 0; i < players.length; i++) {
				if (!(teams.indexOf(players[i].team) > -1)) { //this will keep a running list of all the unique teams
					teams.push(players[i].team);
				}
			}

		//size
			switch (teams.length) {	//the size of the map depends on the number of teams
				case 2:
					var size = 8;
				break;

				case 3:
					var size = 10;
				break;

				case 4:
					var size = 12;
				break;

				case 5:
					var size = 14;
				break;

				default:
					var size = 16;
			}

			gameData.size = size;

		//tiles
			gameData.tiles = {};	//create a nested "tiles" object within the gameData
			var terrainTypes = ["plains","plains","plains","plains","plains","plains","plains","plains","plains","forest","forest","forest","forest","forest","mountains","mountains","mountains","mountains","desert","desert","sea","sea","sea","sea","sea","sea","sea"];	//plains x 9, forest x 5, mountains x 4, desert x 3, sea x 7

			for (var y = 0; y < size; y++) { //use x and y coordinates to create a square grid
				for (var x = 0; x < size; x++) {

					var bonus = [];	//previously placed tile terrains should influence the type of terrain

					if (typeof gameData.tiles[(x - 1) + "," + y] !== "undefined") { //get terrain type to the North
						bonus = [gameData.tiles[(x - 1) + "," + y].terrain];
					}
					if (typeof gameData.tiles[x + "," + (y - 1)] !== "undefined") { //get terrain type to the West
						bonus = [gameData.tiles[x + "," + (y - 1)].terrain];
					}

					var terrain = terrainTypes.concat(bonus, bonus, bonus, bonus)[Math.floor(Math.random() * terrainTypes.concat(bonus, bonus, bonus, bonus).length)];	//pick a random terrain type

					gameData.tiles[x + "," + y] = {
						x: x,				//x coordinate
						y: y,				//y coordinate
						terrain: terrain	//terrain type
					};
				}
			}

		//civilizations
			gameData.civilizations = {};	//create an empty civilizations object
			var cityLocations = [];			//we'll use this later to make sure we don't place cities too close together

			for (var i = 0; i < teams.length; i++) {
				//civ_name
					var civ_name = "";
					var teamCount = 0;
					
					for (var j = 0; j < players.length; j++) {
						if (players[j].team === teams[i]) {
							civ_name += players[j].name; //string all the player names together
							teamCount++; //count the number of people on this team
						}
					}

					civ_name = civ_name.replace(/\s/g,""); //remove spaces from the name

					for (var j = 0; j < Math.floor(Math.random() * teamCount * 3); j++) { //loop through some pseudo-random number of times
						var remove = Math.floor(Math.random() * civ_name.length); //pick a random character
						civ_name = civ_name.slice(0, remove) + civ_name.slice(remove + 1, civ_name.length - 1); //remove it
					}

					var civ_endings = ["topia","ia","land","dom","ry","oro","sica","le","ithia","eros","ica","rien","arith","hold"]; //add a random ending
					civ_name = civ_name + civ_endings[Math.floor(Math.random() * civ_endings.length)];

				//city_name
					var city_endings = ["ton","town","shire","polis"," city","ford","morrow","ville","keep","port","mill","wood","ill","is","dell"];
					var city_name = civ_name + city_endings[Math.floor(Math.random() * city_endings.length)];

				//city location
					var attempts = 0;
					var allowed = null;

					while ((!allowed) && (attempts < 100)) { //test if that location is allowed, and cancel out if necessary
						console.log("attempt number " + attempts);
						allowed = true; //assume it's allowed
						var city_x = Math.floor(Math.random() * size); //generate random coordinates
						var city_y = Math.floor(Math.random() * size); //generate random coordinates

						if (cityLocations.length > 0) { //if there are other cities to check against
							for (var j = 0; j < cityLocations.length; j++) {
								distance = Math.abs(cityLocations[j][0] - city_x) + Math.abs(cityLocations[j][1] - city_y); //calculate how far away each opponent city is
								console.log("distance: " + distance);
								
								if (distance < 8) { //if it's too close, generate a new one
									allowed = false;
								}
							}

							attempts++;
						}
					}

					cityLocations.push([city_x, city_y]);

					if (gameData.tiles[city_x + "," + city_y].terrain !== "plains") {	//if the terrain of this tile isn't already plains, make it plains
						gameData.tiles[city_x + "," + city_y].terrain = "plains";
					}

				//starting resources
					starting_food = 1000;	//these numbers are completely arbitrary right now
					starting_wood = 1000;
					starting_rock = 1000;

				//add to gameData object
					gameData.civilizations["civ_" + teams[i]] = {
						name: civ_name,
						resources: {	//starting resources
							food: starting_food,
							wood: starting_wood,
							rock: starting_rock
						},
						cities: {
							"city_0": {		//starting city
								x: city_x,
								y: city_y,
								name: city_name
							}
						},
						units: {
							"unit_0": {
								x: city_x,	//this unit will start in the capital city
								y: city_y,	//this unit will start in the capital city
								type: "peasant",
								count: 10,	//how many of them there are there in this group
								task: {		//this is what action the unit is currently taking - none for now
									startTimestamp:null,
									endTimestamp:null,
									action:null
								}
							}
						}
					};
			}

		//players
			gameData.players = {}; //create a nested players object within gameData

			for (var i = 0; i < players.length; i++) {
				gameData.players["player_" + i] = {
					id: players[i].id,	//this comes from the users database
					name: players[i].name, //this also comes from the users database
					team: players[i].team, //this comes from the "create game" form, where you choose teams
					x: gameData.civilizations["civ_" + players[i].team].cities["city_0"].x,	//we'll move the player to their capital city
					y: gameData.civilizations["civ_" + players[i].team].cities["city_0"].y //we'll move the player to their capital city
				};
			}

		//queue
			gameData.queue = [];	//this is where player actions will go, since they usually won't resolve immediately

		//insert into mongodb
			return gameData;	//for now, just return it - this would obviously go into a database too
	}

/* getGameData */
	function getGameData(id) {
		//find in mongodb

		var games = [	//this is an example "database"
			{	
				id: 0,
				startTimestamp: 1487742571288,
				players: 4,
				tiles: {
					tile_0: "green",
					tile_1: "red"
				},
				queue: [],
			}
		]

		return games[id];
	}

/* export module */
	module.exports.getGameData = getGameData;
	module.exports.generateGame = generateGame;
