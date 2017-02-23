/* generateGame */
	function generateGame(players) {
		//empty gameData object
			var gameData = {};
			gameData.startTimestamp = new Date().getTime(); //add time that this game begins
			gameData.latestTimestamp = new Date().getTime(); //last time the game was updated - obviously, this is also right now;

		//teams
			var teams = [];	//this will inform how many different civilizations there are. maybe one per player, maybe not
			for (var i = 0; i < players.length; i++) {			/* ===!!!=== Where are we getting 'players' -- okay, just got it - function arg:D ?*/
				if (!(teams.indexOf(players[i].team) > -1)) { 	// if the player's team doesn't exist
					teams.push(players[i].team);				//this will keep a running list of all the unique teams
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

					/* consider adding forumula later? */
			}

			gameData.size = size;

		//tiles
			gameData.tiles = {};	//create a nested "tiles" object within the gameData
			
			var terrainTypes = ["plains","plains","plains","plains","plains","plains","plains","plains","plains","forest","forest","forest","forest","forest","mountains","mountains","mountains","mountains","desert","desert","sea","sea","sea","sea","sea","sea","sea"];	//plains x 9, forest x 5, mountains x 4, desert x 3, sea x 7

			for (var y = 0; y < size; y++) { //use x and y coordinates to create a square grid
				for (var x = 0; x < size; x++) {

					var bonus = [];	//previously placed tile terrains should influence the type of terrain

					if (typeof gameData.tiles[(x - 1) + "," + y] !== "undefined") { //get terrain type to the North
						bonus = [gameData.tiles[(x - 1) + "," + y].terrain];		// if it exists, the bonus is that terrain's type
					}
					if (typeof gameData.tiles[x + "," + (y - 1)] !== "undefined") { //get terrain type to the West
						bonus = [gameData.tiles[x + "," + (y - 1)].terrain];		// if it exists, the bonus is that terrain's type
					}

					var combinedTerrain = terrainTypes.concat(bonus, bonus, bonus, bonus);	// MP - created new variable to shorten code.
					var terrain = combinedTerrain[Math.floor(Math.random() * combinedTerrain.length)];	
					//pick a random terrain type:
					// combine our terrainTypes array with the new bonus tiles
					// pick a # between 0 and length of array
					// pick an element of the array at that index - thereby picking	a random element  

					gameData.tiles[x + "," + y] = {				// tiles[x, y] -- the tile we're currently working on
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
					}	/* ===!!!===So, this just makes the team name sound funny ? */

					var civ_endings = ["topia","ia","land","dom","ry","oro","sica","le","ithia","eros","ica","rien","arith","hold"]; //add a random ending
					civ_name = civ_name + civ_endings[Math.floor(Math.random() * civ_endings.length)];

				//city_name
					var city_endings = ["ton","town","shire","polis"," city","ford","morrow","ville","keep","port","mill","wood","ill","is","dell"];
					var city_name = civ_name + city_endings[Math.floor(Math.random() * city_endings.length)];

				//city location
					var attempts = 0;
					var allowed = null;

					while ((!allowed) && (attempts < 100)) { //test if that location is allowed, and cancel out if necessary
						allowed = true; //assume it's allowed
						var city_x = Math.floor(Math.random() * size); //generate random coordinates
						var city_y = Math.floor(Math.random() * size); //generate random coordinates

						if (cityLocations.length > 0) { //if there are other cities to check against
							for (var j = 0; j < cityLocations.length; j++) {
								distance = Math.abs(cityLocations[j][0] - city_x) + Math.abs(cityLocations[j][1] - city_y); //calculate how far away each opponent city is
								
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
							[city_x + "," + city_y]: {		//starting city
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
							}
						}
					};
			}

		//players
			gameData.players = {}; //create a nested players object within gameData

			for (var i = 0; i < players.length; i++) {
				var city_id = Object.keys(gameData.civilizations["civ_" + players[i].team].cities)[0];

				gameData.players["player_" + i] = {
					id: players[i].id,	//this comes from the users database
					name: players[i].name, //this also comes from the users database
					team: players[i].team, //this comes from the "create game" form, where you choose teams
					x: gameData.civilizations["civ_" + players[i].team].cities[city_id].x,	//we'll move the player to their capital city
					y: gameData.civilizations["civ_" + players[i].team].cities[city_id].y //we'll move the player to their capital city
				};
			}

		//queue
			gameData.queue = [];	//this is where player actions will go, since they usually won't resolve immediately

		//insert into mongodb
			console.log("generated:\n");
			console.log(JSON.stringify(gameData,null,2));
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

/* updateGame */
	function updateGame(gameData) {
		var timestamp = new Date().getTime(); //find out what time it is


		//example queue
		gameData.queue = [
			{
				timestamp: 0,
				action: "movement",
				civ: "civ_1",
				unit: "unit_0",
				x: 4,
				y: 5
			},
			{
				timestamp: 0,
				action: "resource",
				civ: "civ_0",
				unit: "unit_0",
				resource: "food",
				amount: 100,
			},
			{
				timestamp: 0,
				action: "damage",
				civ: "civ_1",
				unit: "unit_0",
				count: -20,
			},
			{
				timestamp: 0,
				action: "creation",
				civ: "civ_2",
				x: 0,
				y: 1,
				type: "peasant",
				count: 100,
			},
			{
				timestamp: 0,
				action: "construction",
				civ: "civ_1",
				unit: "unit_0",
				x: 4,
				y: 5,
				name: "Purpleton"
			},
			{
				timestamp: 0,
				action: "conversion",
				civ: "civ_1",
				unit: "unit_0",
				type: "archer"
			}
		];

		for (var i = 0; i < gameData.queue.length; i++) { //get the event queue and loop through it
			var event = gameData.queue[i];

			if (event.timestamp < timestamp) { //if the event should have happened by now...			

				switch (event.action) {
					case "movement":
						gameData.civilizations[ event.civ ].units[ event.unit ].x = event.x; //update the unit's x coordinate
						gameData.civilizations[ event.civ ].units[ event.unit ].y = event.y; //update the unit's y coordinate
					break;

					case "resource":
						gameData.civilizations[ event.civ ].resources[ event.resource ] += event.amount; //add to the civ's resources for that type of resource
					break;

					case "damage":
						gameData.civilizations[ event.civ ].units[ event.unit ].count += event.count; //subtract people from this unit's count

						if (gameData.civilizations[ event.civ ].units[ event.unit ].count <= 0) { //if the unit is dead...
							delete gameData.civilizations[ event.civ ].units[ event.unit ]; //remove it

							for (var j = 0; j < gameData.queue.length; j++) { //loop through and delete all of the queued events for that unit (of that civ)
								if ((typeof gameData.queue[j].unit !== "undefined") && (typeof gameData.queue[j].civ !== "undefined") && (gameData.queue[j].unit === event.unit) && (gameData.queue[j].civ === event.civ)) {
									gameData.queue.splice(j,1);
									j--;
								}
							}
						}
					break;

					case "conversion":
						gameData.civilizations[ event.civ ].units[ event.unit ].type = event.type; //change the type of unit
					break;

					case "construction":
						gameData.civilizations[ event.civ ].cities[event.x + "," + event.y] = { //add this city to this civilization
							x: event.x,	//this city will be built on the current tile
							y: event.y,	//this city will be built on the current tile
							name: event.name, //city's name
						}
					break;

					case "creation":
						var unit_ids = Object.keys(gameData.civilizations[ event.civ ].units); //get all the unit ids
						var lastUnit_id = unit_ids[unit_ids.length - 1]; //get the last unit id (something like "unit_7")
						var newUnit_id = "unit_" + (1 + Number(lastUnit_id.substring(lastUnit_id.indexOf("_") + 1, lastUnit_id.length))); //get the number part and add 1
						
						gameData.civilizations[ event.civ ].units[newUnit_id] = { //add this unit to this civilization
							x: event.x,	//this unit will start in the city where it is spawned
							y: event.y,	//this unit will start in the city where it is spawned
							type: event.type, //what type of unit
							count: event.count,	//how many of them there are there in this group
						}
					break;
				}

				gameData.queue.splice(i,1); //remove that event from the queue
				i--;
			}
		}

		//send to mongo
		console.log("updated:\n");
		console.log(JSON.stringify(gameData,null,2));
		return gameData; //send it back to the index file so the game can be viewed
	}

/* moveUnit */
	function moveUnit(civ_id, unit_id, unit, tile, start, effects) {
		if (start === null) {
			var start = new Date().getTime(); //if no queued start time, assume now
		}
		var duration = null;

		switch (tile.terrain) { //determine the traveling time based on the terrain
			case "plains":
				switch (unit.type) { //further determine traveling time based on unit type
					case "soldier":
						duration = 1000 * 60 * 60 * 2;
					break;

					case "archer":
						duration = 1000 * 60 * 60 * 2;
					break;

					case "knight":
						duration = 1000 * 60 * 60 * 1;
					break;

					case "seige":
						duration = 1000 * 60 * 60 * 3;
					break;

					case "ship":
						return [{}];
					break;

					default: //includes peasants of all kinds, plus players
						duration = 1000 * 60 * 60 * 2;
					break;
				}
			break;

			case "forest":
				switch (unit.type) {
					case "soldier":
						duration = 1000 * 60 * 60 * 3;
					break;

					case "archer":
						duration = 1000 * 60 * 60 * 3;
					break;

					case "knight":
						duration = 1000 * 60 * 60 * 2;
					break;

					case "seige":
						duration = 1000 * 60 * 60 * 4;
					break;

					case "ship":
						return [{}];
					break;

					default: //includes peasants of all kinds, plus players
						duration = 1000 * 60 * 60 * 2;
					break;
				}
			break;

			case "mountains":
				switch (unit.type) {
					case "soldier":
						duration = 1000 * 60 * 60 * 4;
					break;

					case "archer":
						duration = 1000 * 60 * 60 * 4;
					break;

					case "knight":
						duration = 1000 * 60 * 60 * 4;
					break;

					case "seige":
					case "ship":
						return [{}];
					break;

					default: //includes peasants of all kinds, plus players
						duration = 1000 * 60 * 60 * 3;
					break;
				}
			break;

			case "desert":
				switch (unit.type) {
					case "soldier":
						duration = 1000 * 60 * 60 * 3;
					break;

					case "archer":
						duration = 1000 * 60 * 60 * 3;
					break;

					case "knight":
						duration = 1000 * 60 * 60 * 2;
					break;

					case "seige":
						duration = 1000 * 60 * 60 * 3;
					break;

					case "ship":
						return [{}];
					break;

					default: //includes peasants of all kinds, plus players
						duration = 1000 * 60 * 60 * 3;
					break;
				}
			break;

			case "sea":
				switch (unit.type) {
					case "ship":
						duration = 1000 * 60 * 60 * 1;
					break;

					default: //includes peasants of all kinds, plus players
						duration = null;
					break;
				}
			break;
		}

		if (effects !== null) { //effects from weather or spells, etc.
			eval(effects);
		}

		return [
			{ //return an array of objects that we'll merge with the queue
				timestamp: (start + duration),
				action: "movement",
				civ: civ_id,
				unit: unit_id,
				x: tile.x,
				y: tile.y
			}
		]
	}

/* gatherResource */
	function gatherResource(civ_id, unit_id, unit, tile, start, effects) {
		if (start === null) {
			var start = new Date().getTime();
		}
		var duration = null;
		var resource = null;

		switch (tile.terrain) {
			case "plains":
				switch (unit.type) { //as above, but also determine resource from the terrain
					case "peasant":
					case "farmer":
						duration = 1000 * 60 * 60 * 3;
						resource = "food";
					break;

					default: //includes all other units, plus players
						return [{}];
					break;
				}
			break;

			case "forest":
				switch (unit.type) {
					case "peasant":
					case "lumberjack":
						duration = 1000 * 60 * 60 * 3;
						resource = "wood";
					break;

					default: //includes all other units, plus players
						return [{}];
					break;
				}
			break;

			case "mountains":
				switch (unit.type) {
					case "peasant":
					case "miner":
						duration = 1000 * 60 * 60 * 3;
						resource = "rock";
					break;

					default: //includes all other units, plus players
						return [{}];
					break;
				}
			break;

			case "desert": //no resources here
				return [{}];
			break;

			case "sea":
				switch (unit.type) {
					case "ship":
						duration = 1000 * 60 * 60 * 3;
						resource = "food";
					break;

					default: //includes all other units, plus players
						return [{}];
					break;
				}
			break;
		}

		if (effects !== null) {
			eval(effects);
		}

		return [
			{
				timestamp: (start + duration),
				action: "resource",
				civ: civ_id,
				unit: unit_id,
				resource: resource,
				amount: unit.count
			}
		]
	}

/* convertUnit */
	function convertUnit(civ_id, unit_id, unit, newType, start, effects) {
		if (start === null) {
			var start = new Date().getTime();
		}
		var duration = null;
		var foodCost = 0;
		var woodCost = 0;
		var rockCost = 0;

		switch (unit.type) { //nested switch cases - first, what unit is it now, and then, what unit will it be?
			case "player":
				return [{}];
			break;

			case "peasant":
			case "farmer":
			case "lumberjack":
			case "miner":
			case "builder":
				switch (newType) {
					case "peasant":
					case "farmer":
					case "lumberjack":
					case "miner":
					case "builder":
						var duration = 0;
						var foodCost = 0;
						var woodCost = 0;
						var rockCost = 0;
					break;

					case "soldier":
						var duration = 1000 * 60 * 60 * 3;
						var foodCost = 10;
						var woodCost = 10;
						var rockCost = 10;
					break;

					case "archer":
						var duration = 1000 * 60 * 60 * 4;
						var foodCost = 10;
						var woodCost = 20;
						var rockCost = 0;
					break;

					case "knight":
						var duration = 1000 * 60 * 60 * 5;
						var foodCost = 30;
						var woodCost = 10;
						var rockCost = 0;
					break;

					case "seige":
						var duration = 1000 * 60 * 60 * 5;
						var foodCost = 0;
						var woodCost = 50;
						var rockCost = 50;
					break;

					case "ship":
						var duration = 1000 * 60 * 60 * 7;
						var foodCost = 10;
						var woodCost = 100;
						var rockCost = 30;
					break;
				}
			break;

			case "soldier":
			case "archer":
			case "knight":
			case "seige":
				switch (newType) {
					case "peasant":
					case "farmer":
					case "lumberjack":
					case "miner":
					case "builder":
						var duration = 1000 * 60 * 60 * 1;
						var foodCost = 0;
						var woodCost = 0;
						var rockCost = 0;
					break;

					case "soldier":
						var duration = 1000 * 60 * 60 * 1;
						var foodCost = 10;
						var woodCost = 10;
						var rockCost = 10;
					break;

					case "archer":
						var duration = 1000 * 60 * 60 * 2;
						var foodCost = 10;
						var woodCost = 20;
						var rockCost = 0;
					break;

					case "knight":
						var duration = 1000 * 60 * 60 * 2;
						var foodCost = 30;
						var woodCost = 10;
						var rockCost = 0;
					break;

					case "seige":
						var duration = 1000 * 60 * 60 * 4;
						var foodCost = 0;
						var woodCost = 50;
						var rockCost = 50;
					break;

					case "ship":
						var duration = 1000 * 60 * 60 * 6;
						var foodCost = 10;
						var woodCost = 100;
						var rockCost = 30;
					break;
				}
			break;

			case "ship":
				switch (newType) {
					case "peasant":
					case "farmer":
					case "lumberjack":
					case "miner":
					case "builder":
						var duration = 1000 * 60 * 60 * 1;
						var foodCost = 0;
						var woodCost = 0;
						var rockCost = 0;
					break;

					case "soldier":
						var duration = 1000 * 60 * 60 * 2;
						var foodCost = 10;
						var woodCost = 10;
						var rockCost = 10;
					break;

					case "archer":
						var duration = 1000 * 60 * 60 * 2;
						var foodCost = 10;
						var woodCost = 20;
						var rockCost = 0;
					break;

					case "knight":
						var duration = 1000 * 60 * 60 * 2;
						var foodCost = 30;
						var woodCost = 10;
						var rockCost = 0;
					break;

					case "seige":
						var duration = 1000 * 60 * 60 * 3;
						var foodCost = 0;
						var woodCost = 50;
						var rockCost = 50;
					break;

					case "ship":
						var duration = 0;
						var foodCost = 0;
						var woodCost = 0;
						var rockCost = 0;
					break;
				}
			break;
		}

		if (effects !== null) {
			eval(effects);
		}

		return [
			{
				timestamp: (start + duration),
				action: "conversion",
				civ: civ_id,
				unit: unit_id,
				type: newType
			},
			{							//these events will execute immediately and charge the corresponding resources
				timestamp: start,
				action: "resource",
				civ: civ_id,
				resource: "food",
				amount: -(foodCost)
			},
			{							//these events will execute immediately and charge the corresponding resources
				timestamp: start,
				action: "resource",
				civ: civ_id,
				resource: "wood",
				amount: -(woodCost)
			},
			{							//these events will execute immediately and charge the corresponding resources
				timestamp: start,
				action: "resource",
				civ: civ_id,
				resource: "rock",
				amount: -(rockCost)
			}
		]
	}

/* createUnit */
	function createUnit(civ_id, city, type, count, start, effects) {
		if (type === null) {
			type = "peasant";
		}
		if (count === null) {
			count = 100;
		}

		var duration = 1000 * 60 * 60 * 12;
		var foodCost = 100;

		if (effects !== null) {
			eval(effects);
		}

		return [
			{
				timestamp: (start + duration),
				action: "creation",
				civ: civ_id,
				x: city.x,
				y: city.y,
				type: type,
				count: count,
			},
			{							//these events will execute immediately and charge the corresponding resources
				timestamp: start,
				action: "resource",
				civ: civ_id,
				resource: "food",
				amount: -(foodCost)
			}
		]
	}

/* constructPlace */
	function constructPlace(civ_id, unit_id, unit, type, name, start, effects) {
		if (start === null) {
			var start = new Date().getTime();
		}
		var duration = null;
		var foodCost = 0;
		var woodCost = 0;
		var rockCost = 0;

		switch (type) {
			case "city":
				duration = 1000 * 60 * 60 * 48;
				foodCost = 1000;
				woodCost = 5000;
				rockCost = 3000;
			break;

			case "wall":
				duration = 1000 * 60 * 60 * 24;
				foodCost = 0;
				woodCost = 1000;
				rockCost = 5000;
			break;

			case "tower":
				duration = 1000 * 60 * 60 * 36;
				foodCost = 0;
				woodCost = 3000;
				rockCost = 3000;
			break;

			default:
				return [{}];
			break;
		}

		return [{
				timestamp: (start + duration),
				action: "construction",
				civ: civ_id,
				unit: unit_id,
				x: unit.x,
				y: unit.y,
				type: type,
				name: name
			},
			{							
				timestamp: start,
				action: "resource",
				civ: civ_id,
				resource: "food",
				amount: -(foodCost)
			},
			{							
				timestamp: start,
				action: "resource",
				civ: civ_id,
				resource: "wood",
				amount: -(woodCost)
			},
			{							
				timestamp: start,
				action: "resource",
				civ: civ_id,
				resource: "rock",
				amount: -(rockCost)
			}
		]
	}

/* attackUnit */ //not done!!!
	function attackUnit(civ_id, unit_id, unit, tile, start, effects) {
		if (start === null) {
			var start = new Date().getTime();
		}
		var duration = null;
		var resource = null;

		switch (tile.terrain) {
			case "plains":
				switch (unit.type) { //as above, but also determine resource from the terrain
					case "peasant":
					case "farmer":
						duration = 1000 * 60 * 60 * 3;
						resource = "food";
					break;

					default: //includes all other units, plus players
						duration = null;
						resource = null;
					break;
				}
			break;

			case "forest":
				switch (unit.type) {
					case "peasant":
					case "lumberjack":
						duration = 1000 * 60 * 60 * 3;
						resource = "wood";
					break;

					default: //includes all other units, plus players
						duration = null;
						resource = null;
					break;
				}
			break;

			case "mountains":
				switch (unit.type) {
					case "peasant":
					case "miner":
						duration = 1000 * 60 * 60 * 3;
						resource = "rock";
					break;

					default: //includes all other units, plus players
						duration = null;
						resource = null;
					break;
				}
			break;

			case "desert": //no resources here
				duration = null;
				resource = null;
			break;

			case "sea":
				switch (unit.type) {
					case "ship":
						duration = 1000 * 60 * 60 * 3;
						resource = "food";
					break;

					default: //includes all other units, plus players
						duration = null;
						resource = null;
					break;
				}
			break;
		}

		if (effects !== null) {
			eval(effects);
		}

		return {
			timestamp: (start + duration),
			action: "resource",
			civ: civ_id,
			unit: unit_id,
			resource: resource,
			amount: unit.count
		};
	}

/* export module */
	module.exports.getGameData = getGameData;
	module.exports.generateGame = generateGame;
	module.exports.updateGame = updateGame;

