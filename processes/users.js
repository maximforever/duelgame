/* getUserData */
	function getUserData(id) {
		//find in mongodb

		var users = [	//this is an example "database"
			{
				id: 0,
				name: "max",
				email: "flufci@gmail.com"
			},
			{
				id: 1,
				name: "james",
				email: "jamesbmayr@gmail.com"
			}
		]

		return users[id];
	}

/* export module */
	module.exports.getUserData = getUserData;