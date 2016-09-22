var $userSteamID = "";
var $userSteamName = "";
var $allConcepts = "";
var $allThemes = "";
var $allGamesHome = "";
var $usersGames = "";
var $gamesList = "";

$(document).ready(function () {
	"use strict";

	var initialLoad = false;
	if (!initialLoad) {
		getUsername();
		initialLoad = true;
	}

	if ($userSteamID == "") {
		$("#logOut").hide();
		$("#getList").hide();
		$("#randomOwned").hide();
	}

	$("#gbUpdate").click(function () {
		$.post("http://localhost:3000/gbAll", {}, function (data) {});
	});

	$("#testButton").click(function () {
		$.post("http://localhost:3000/test", {"steamName": $("#inputSteamName").val()}, function (data) {
			console.log(data);
		});

	});
	// $("#signup").click(function () {
	// 	$("#signinButton").hide();
	// 	$("#registerButton").show();
	// 	$("#inputDIVSteamID").show();
	// 	$("#inputDIVSteamName").show();
	// 	$("#registerSignin-title").empty().append("Sign Up");
	// 	$("#registerSignIn").modal();
	// 	$("#errorMsg2").text("");
	// });

	$("#helpButton").click(function () {
		$("#registerSignIn").modal("hide");
		renderAboutPage();
	});

	// $("#signin").click(function () {
	// 	$("#registerButton").hide();
	// 	$("#signinButton").show();
	// 	$("#inputDIVSteamID").hide();
	// 	$("#inputDIVSteamName").hide();
	// 	$("#registerSignin-title").empty().append("Sign In");
	// 	$("#registerSignIn").modal();
	// 	$("#errorMsg2").text("");
	// });

	$("#lookupButton").click(function () {

		$.post("http://localhost:3000/lookupID64", {
			"steamName": $("#inputSteamName").val()
		}, function (data) {
			if (data.err === undefined && data.games.length > 0) {
				$userSteamID = data.steam_id;
				$userSteamName = data.steam_name;
				$usersGames = data.games;
				$("#getList").show(); //add to navbar my steam list
				$("#randomOwned").show(); //add to navbar random gbGame I own
				showSteamGames($usersGames);
			} else {
				if(data.game_count === 0) {
					alert("No Games Found!")
				} else {
					alert(data.err);
				}
			}
		});
	});

	$("#home").click(function () {
		makeHome();
	});

	$("#brand").click(function () {
		makeHome();
	});

	$("#searchGenre").click(function () {
		buildGenres();
	});

	$("#searchDeveloper").click(function () {
		buildDeveloper();
	});

	$("#random").click(function () {
		randomGame();
	});

	$("#randomOwned").click(function () {
		randomGameOwn();
	});

	$("#searchConcept").click(function () {
		$("#gameList").empty();

		$.get("http://localhost:3000/getConcepts", function (data) {
			if (data.length != 0) {
				$allConcepts = _.sortBy(data);
				buildConcepts("a");
			}
		});
	});

	$("#searchTheme").click(function () {
		$("#gameList").empty();

		$.get("http://localhost:3000/getThemes", function (data) {
			if (data.length != 0) {
				$allThemes = _.sortBy(data);
				buildThemes("all");
			}
		});
	});

	// $("#registerButton").click(function () {
	// 	var registrationData = _.object($("#registerSignIn-form").serializeArray().map(function (v) {
	// 		return [v.name, v.value];
	// 	})); //returns form values as key value pairs
	// 	$.post("http://localhost:3000/exists", {
	// 		"username": registrationData.email.toLowerCase()
	// 	}, function (data) {
	// 		if (data.length != 0) {
	// 			$("#errorMsg2").text("Sign up failed. Account already exists, please try again!");
	// 			$("#errorMsg2").effect("shake");
	// 		} else {
	// 			$.post("http://localhost:3000/signup", {
	// 				"username": registrationData.email.toLowerCase(),
	// 				"password": registrationData.password,
	// 				"steamID": registrationData.steamID
	// 			}, function (data) {
	// 				$("#inputEmail").val("");
	// 				$("#inputPassword").val("");
	// 				$("#inputSteamID").val("");
	// 				$("#registerSignIn").modal("hide");
	// 			});
	// 		}
	// 	});
	// });
    //
	// $("#signinButton").click(function () {
	// 	var signinData = _.object($("#registerSignIn-form").serializeArray().map(function (v) {
	// 		return [v.name, v.value];
	// 	})); //converts form data to associative array
	// 	$.post("http://localhost:3000/signin", {
	// 		"username": signinData.email.toLowerCase(),
	// 		"password": signinData.password
	// 	}, function (data) {
	// 		if (data.err === undefined) {
	// 			$userSteamName = data.username;
	// 			$userSteamID = data.steamID;
    //
	// 			$("#registerSignIn").modal("hide");
	// 			$("#inputEmail").val("");
	// 			$("#inputPassword").val("");
	// 			$("#inputSteamID").val("");
	// 			$("#signup").hide();
	// 			$("#signin").hide();
	// 			$("#login").hide();
	// 			$("#logOut").show();
	// 			$("#getList").show();
	// 			$("#randomOwned").show();
	// 			var $greeting = '<span class="text-primary" id="greeting">Hello, ' + $userSteamName + '!</li>';
	// 			$("#navbar").append($greeting);
	// 			// showSteamGames(0, "time");
	// 			showSteamGames();
	// 		} else {
	// 			$("#errorMsg2").text(data.err);
	// 			$("#errorMsg2").effect("shake");
	// 		}
	// 	});
	// });

	$("#getList").click(function () {
		// showSteamGames(0, "time");
		showSteamGames($usersGames);
	});

	//takes in result from querying steam_users
	function showSteamGames(usersGamesList) {
		$("#gameList").empty();
		var temp = "Building Steam List. Please wait, This can take a few minutes...";
		$("#gameList").append(temp);
		if ($userSteamID != "") {
				if (usersGamesList.length != 0) {
					$("#gameList").empty().append(
						$userSteamName + '\'s Steam Games (Count: ' + usersGamesList.length + '):\
						<table id="gameTable" class="text-center display">\
			<thead>\
				<tr>\
				  <th class="text-center">Game Art</th>\
				  <th class="text-center">Title</th>\
				  <th class="text-center">Description</th>\
				  <th class="text-center">Themes</th>\
				  <th class="text-center">Genres</th>\
				  <th class="text-center">Play Time</th>\
				  <th class="text-center">Launch Game</th>\
				</tr>\
			</thead>\
		  </table>');
					$('#gameTable').DataTable({
						"processing": true,
						"serverSide": false,
						"order": [
							[5, "desc"]
						],
						"data": $usersGames,
						"columnDefs": [{
							"targets": [0],
							"searchable": false,
							"data": "img_logo_url",
							"render": function (data, type, row) {
									if(row["appid"] && data)
										return '<a href=# onclick="viewGame(' + row["appid"] + ')"><img class="img box-shadow--6dp" src="http://media.steampowered.com/steamcommunity/public/images/apps/' + row["appid"] + '/' + data + '.jpg"/</a>'; //gbGame art';
									else
										return "No Image Found."
							}
						}, {
							"targets": [1],
							"data": "name",
							"render": function (data, type, row) {
								var nameNoSpace = data.replace(/ /g, "+");
								return '<a href=' + row["site_detail_url"] +' target="_blank">' + data + '</a>';
							}
						},  {
							"targets": [2],
							"data": "deck",
							"render": function (data, type, row) {
								if(data != null) {
									return data;
								} else {
									return "No description found."
								}

							}
						},	{
							"targets": [3],
							"data": "themes",
							"render": function (data, type, row) {
								if(data != null) {
									var temp = "";
									var length = data.length;
									for(var i = 0; i< length; i++){
										if(i < length-1){
											temp += data[i].name + ", ";
										} else {
											temp += data[i].name;
										}

									}
									return temp;
								} else {
									return "No themes found."
								}

							}
						},	{
							"targets": [4],
							"data": "genres",
							"render": function (data, type, row) {
								if(data != null) {
									var temp = "";
									var length = data.length;
									for(var i = 0; i< length; i++){
										if(i < length-1){
											temp += data[i].name + ", ";
										} else {
											temp += data[i].name;
										}

									}
									return temp;
								} else {
									return "No genres found."
								}
							}
						}, 	{
							"targets": [5],
							"searchable": false,
							"data": "playtime_forever",
							"render": {
								"display": function (data, type, row) {
									// if(type == "sort"){
									// 	return data;
									// } else
									if (data != 0) {
										var days = Math.floor(data / 1440);
										var remainingMinutes = data % 1440;
										var hours = Math.floor(remainingMinutes / 60);
										var minutes = remainingMinutes % 60;
										return days + ' days,<br> ' + hours + ' hours,<br> ' + minutes + ' minutes';
									} else {
										return "Never Played";
									}
									// return data;
								},
								"filter": "playtime_forever"
							}
						}, {
							"targets": [6],
							"searchable": false,
							"data": "appid",
							"render": function (data, type, row) {
								return '<a href="steam://run/' + data + '"><button type="button" class="btn btn-primary btn-md">Launch Game</button>';
							}

						}]
					});
				}
		}
	}
	// $("#logOut").click(function () {
	// 	$userSteamName = "";
	// 	$userSteamID = "";
	// 	$usersGames = "";
    //
	// 	$("#signup").show();
	// 	$("#signin").show();
	// 	$("#login").show();
	// 	$("#logOut").hide();
	// 	$("#getList").hide();
	// 	$("#greeting").remove();
	// 	$("#gameList").empty();
	// 	$("#randomOwned").hide();
	// 	makeHome();
	// });

	$("#about").click(function () {
		renderAboutPage();
		//render the content of About webpage
	});

	$("#contact").click(function () {
		renderContactPage();
		//render the content of Contact webpage
	});
	function buildGenres() {
		$("#gameList").empty();

		$.get("http://localhost:3000/getGenres", function (data) {
			if (data.length != 0) {
				data = _.sortBy(data);
				var text = '<div class="container">';

				text += '<div class="col-lg-12"><h1 style="color:#dd4814" class="page-header">Choose a Genre</h1></div>';
				text += '<table class="table"><tbody>';
				text += '<tr>';
				var toggle = false;
				for (var i = 0; i < data.length; i++) {
					if (toggle) {
						var color = 'btn-info';
						toggle = false;
					} else {
						var color = 'btn-danger';
						toggle = true;
					}
					var noSingleQ = data[i].replace(/'/g, "\\\'");
					text += '<td><button onclick="searchGenre(\'' + noSingleQ + '\')" type="button" class="btn ' + color + ' btn-lg btn-block">' + data[i] + '</button></a>';
					if (((i + 1) % 5) == 0) {
						text += '<tr>';
					}
				}
				$("#gameList").append(text);
			}
		});
	}

	function buildDeveloper() {
		$("#gameList").empty();

		$.get("http://localhost:3000/getDevelopers", function (data) {
			if (data.length != 0) {
				data = _.sortBy(data);
				var text = '<div class="container">';

				text += '<div class="col-lg-12"><h1 style="color:#dd4814" class="page-header">Choose a Developer</h1></div>';
				text += '<table class="table"><tbody>';
				text += '<tr>';
				var toggle = false;
				for (var i = 0; i < data.length; i++) {
					if (toggle) {
						var color = 'btn-info';
						toggle = false;
					} else {
						var color = 'btn-danger';
						toggle = true;
					}
					var noSingleQ = data[i].replace(/'/g, "\\\'");
					text += '<td><button onclick="searchDeveloper(\'' + noSingleQ + '\')" type="button" class="btn ' + color + ' btn-lg btn-block">' + data[i] + '</button></a>';
					if (((i + 1) % 3) == 0) {
						text += '<tr>';
					}
				}
				$("#gameList").append(text);
			}
		});
	}

	function buildConcepts(sort) {
		$("#gameList").empty();
		var text = '<div class="container">';

		text += '<div class="col-lg-12"><h1 style="color:#dd4814" class="page-header">Choose a Concept</h1></div>';
		text += '<table class="table"><tbody>';
		text += '<tr>';

		if (sort != "all") {
			if (sort == "#") {
				var filData = _.filter($allConcepts, function (word) {
					return word.substring(0, 1).toLowerCase() == word.substring(0, 1).toUpperCase()
				});
			} else {
				var filData = _.filter($allConcepts, function (word) {
					return word.substring(0, 1).toLowerCase() == sort
				});
			}
		} else {
			var filData = $allConcepts;
		}

		var pages = '#abcdefghijklmnopqrstuvwxyz'.split('');

		text += '<nav><ul class="pagination pagination-sm">';

		for (var x = 0; x < pages.length; x++) {
			if (pages[x] == sort) {
				text += '<li class="active"><a href="#" onclick="buildConcepts(\'' + pages[x] + '\')">' + pages[x] + '</a></li>';
			} else {
				text += '<li><a href="#" onclick="buildConcepts(\'' + pages[x] + '\')">' + pages[x] + '</a></li>';
			}
		}
		text += '<li><a href="#" onclick="buildConcepts(\'all\')">All</a></li>';
		text += '</ul></nav>';
		var toggle = false;
		for (var i = 0; i < filData.length; i++) {
			var noSingleQ = filData[i].replace(/'/g, "\\\'");
			noSingleQ = noSingleQ.replace(/"/g, "");
			if (toggle) {
				var color = 'btn-default';
				toggle = false;
			} else {
				var color = 'btn-warning';
				toggle = true;
			}
			text += '<td><button onclick="searchConcept(\'' + noSingleQ + '\')" type="button" class="btn ' + color + ' btn btn-block" title="' + filData[i] + '">' + filData[i] + '</button></a>';
			if (((i + 1) % 3) == 0) {
				text += '<tr>';
			}
		}
		$("#gameList").append(text);
	}

	function buildThemes(sort) {
		$("#gameList").empty();
		var text = '<div class="container">';

		text += '<div class="col-lg-12"><h1 style="color:#dd4814" class="page-header">Choose a Theme</h1></div>';
		text += '<table class="table"><tbody>';
		text += '<tr>';

		if (sort != "all") {
			if (sort == "#") {
				var filData = _.filter($allThemes, function (word) {
					return word.substring(0, 1).toLowerCase() == word.substring(0, 1).toUpperCase()
				});
			} else {
				var filData = _.filter($allThemes, function (word) {
					return word.substring(0, 1).toLowerCase() == sort
				});
			}
		} else {
			var filData = $allThemes;
		}

		var pages = '#abcdefghijklmnopqrstuvwxyz'.split('');

		text += '<nav><ul class="pagination pagination-sm">';

		for (var x = 0; x < pages.length; x++) {
			if (pages[x] == sort) {
				text += '<li class="active"><a href="#" onclick="buildThemes(\'' + pages[x] + '\')">' + pages[x] + '</a></li>';
			} else {
				text += '<li><a href="#" onclick="buildThemes(\'' + pages[x] + '\')">' + pages[x] + '</a></li>';
			}
		}
		text += '<li><a href="#" onclick="buildThemes(\'all\')">All</a></li>';
		text += '</ul></nav>';
		var toggle = false;
		for (var i = 0; i < filData.length; i++) {
			var noSingleQ = filData[i].replace(/'/g, "\\\'");
			noSingleQ = noSingleQ.replace(/"/g, "");
			if (toggle) {
				var color = 'btn-success';
				toggle = false;
			} else {
				var color = 'btn-primary';
				toggle = true;
			}
			text += '<td><button onclick="searchTheme(\'' + noSingleQ + '\')" type="button" class="btn ' + color + ' btn-lg btn-block" title="' + filData[i] + '">' + filData[i] + '</button></a>';
			if (((i + 1) % 3) == 0) {
				text += '<tr>';
			}
		}
		$("#gameList").append(text);
	}

	function match($appID) {
		if ($appID != "") {
			var temp = $("#input" + $appID).val();
			$("#table" + $appID).empty();
			var text = '<a href="http://www.giantbomb.com/gbGame/3030-' + temp + '/" target="_blank"><button type="button" class="btn btn-primary">Giant Bomb Page</button>';
			$("#table" + $appID).append(text);
			$.post("http://localhost:3000/match", {
				"steamAppID": parseInt($appID),
				"giantBombID": parseInt(temp)
			}, function (data) {});
		}
	}

	function bestMatch(name, steamAppID) {
		$.post("http://localhost:3000/bestMatch", {
			"steamName": name
		}, function (data) {
			$("#table" + steamAppID).empty();
			var text = '<a href="http://www.giantbomb.com/gbGame/3030-' + data.appID + '/" target="_blank"><button type="button" class="btn btn-primary">Giant Bomb Page</button>';
			$("#table" + steamAppID).append(text);
			$.post("http://localhost:3000/match", {
				"steamAppID": parseInt(steamAppID),
				"giantBombID": parseInt(data.appID)
			}, function (data) {});
		});
	}


	function filterTableToOwnedGames(data) {
		var filteredGames = [];
		var temp;
		$.each($usersGames, function (index, value){
			temp = _.findWhere(data, {steamAppID: value["appid"].toString()});
			if(temp)
				filteredGames.push(temp)
		});
		return filteredGames;
	}

	$(document).on('change','#onlyOwnedGames',function(){
		if(this.checked)
			$('#filteredTable').DataTable().clear().rows.add(filterTableToOwnedGames($gamesList)).draw();
		else
			$('#filteredTable').DataTable().clear().rows.add($gamesList).draw();

	});






	function getUsername() {
		$.get("http://localhost:3000/getUsername", function (data) {
			if(data.steamID != "") {
				$userSteamID = data.steamID;
				$userSteamName = data.username;
				$usersGames = data.steamGames.games;
				$("#inputSteamName").val(data.username);
				$("#getList").show(); //add to navbar my steam list
				$("#randomOwned").show(); //add to navbar random gbGame I own
				// var $greeting = '<span class="text-primary" id="greeting">Hello, ' + $userSteamName + '!</li>';
				// $("#navbar").append($greeting);
				// showSteamGames(0, "time");
				showSteamGames($usersGames);
			}
		});
	}



	// function randomGame() {
	// 	var game = _.sample($allGamesHome);
	// 	viewGame(gbGame.id);
	// }

	function randomGameOwn() {
		if ($userSteamID != "") {
			var game = "";
			do
				game = _.sample($usersGames);
			while (game.appid == 0);
			viewGame(game.appid);
		}
	}

	function renderAboutPage() {
		$("#gameList").empty();
		var text = '<div class="container">\
							<h2>Instructions</h2>\
							To find your Steam Community Name/Steam ID<br>\
							1. Visit  http://steamcommunity.com/<br>\
							<img src="/images/steam1.jpg" width="100%"><br>\
							2. Under “FIND PEOPLE” Type in your Steam username and click on the magnifying glass or hit enter.<br>\
							<img src="/images/steam2.jpg" width="100%"><br>\
							3. Find your Steam account from the list of returned results. If you have previously set a Custom Steam Community URL, your Steam Community Name will appear as the white part of your Custom URL.  If no custom URL is set, continue to step 4<br>\
							<img src="/images/steam3.jpg" width="100%"><br>\
							4. If you have not set a Custom URL, you’ll have to find your Steam ID by clicking your Steam account from the list. (In this example, it is Furbe).<br>\
							<img src="/images/steam4.jpg" width="100%"><br>\
							5. Your Steam ID is at the end of your profile URL. (In this example, the user’s Steam ID would be 76561197960439684)<br>\
						</div>';


		$("#gameList").append(text);
	}

	function renderContactPage() {
		$("#gameList").empty();

		var text = '<div class="container">';
		text += '<h2>Contact Us</h2>';
		text += '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.409156782101!2d-117.88568918487645!3d33.87911483428126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcd5ce3d37c98f%3A0xfd990b1909bca0aa!2s800+N+State+College+Blvd%2C+Fullerton%2C+CA+92831!5e0!3m2!1sen!2sus!4v1462864077595" width="600" height="450" frameborder="0" style="border:0" allowfullscreen></iframe>';
		text += '</div>';

		$("#gameList").append(text);

	}
});

function viewGame(id) {
	$.get("http://localhost:3000/game/" + id, function (data) {
		if (data.length != 0) {
			$("#gameList").empty();
			$("#gamePage").empty();
			var text = '<ul class="list-group"><li class="list-group-item"><h1 style="color:#dd4814">' + data.name + '';
			// text += '<li class="list-group-item"><img class="img-thumbnail box-shadow--8dp" src="' + data.image.super_url + '" title="' + data.name + '">';
			text += '<li class="list-group-item"><a href="steam://run/' + data.appid + '"><button type="button" class="btn btn-success btn-lg">Launch Game On Steam</button></a>';

			if (data.developers != null) {
				text += '<li class="list-group-item"><h3>Developers</h3>';
				text += '<table class="table"><tbody>';
				text += '<tr>';
				for (var x = 0; x < data.developers.length; x++) {
					var noSingleQ = data.developers[x].name.replace(/'/g, "\\\'");
					text += '<td><button onclick="searchDeveloper(\'' + noSingleQ + '\')" type="button" class="btn btn-danger btn-lg btn-group btn-block">' + data.developers[x].name + '</button></a>';
					if (((x + 1) % 5) == 0) {
						text += '<tr>';
					}
				}
				text += '</table></li>';
			}

			if (data.genres != null) {
				text += '<li class="list-group-item"><h3>Genres</h3>';
				text += '<table class="table"><tbody>';
				text += '<tr>';
				for (var x = 0; x < data.genres.length; x++) {
					var noSingleQ = data.genres[x].name.replace(/'/g, "\\\'");
					text += '<td><button onclick="searchGenre(\'' + noSingleQ + '\')" type="button" class="btn btn-danger btn-lg btn-group btn-block">' + data.genres[x].name + '</button></a>';
					if (((x + 1) % 5) == 0) {
						text += '<tr>';
					}
				}
				text += '</table></li>';
			}

			if (data.themes != null) {
				text += '<li class="list-group-item"><h3>Themes</h3>';
				text += '<table class="table"><tbody>';
				text += '<tr>';
				for (var x = 0; x < data.themes.length; x++) {
					var noSingleQ = data.themes[x].name.replace(/'/g, "\\\'");
					text += '<td><button onclick="searchTheme(\'' + noSingleQ + '\')" type="button" class="btn btn-success btn-lg btn-group btn-block">' + data.themes[x].name + '</button></a>';
					if (((x + 1) % 5) == 0) {
						text += '<tr>';
					}
				}
				text += '</table></li>';
			}

			if (data.concepts != null) {
				text += '<li class="list-group-item"><h3>Concepts</h3>';
				text += '<table class="table"><tbody>';
				text += '<tr>';
				for (var x = 0; x < data.concepts.length; x++) {
					var noSingleQ = data.concepts[x].name.replace(/'/g, "\\\'");
					text += '<td><button onclick="searchConcept(\'' + noSingleQ + '\')" type="button" class="btn btn-warning btn-sm btn-group btn-block">' + data.concepts[x].name + '</button></a>';
					if (((x + 1) % 3) == 0) {
						text += '<tr>';
					}
				}
				text += '</table></li>';
			}


			// text += '<li class="list-group-item"><h2>Giant Bomb Game Information';
			// text += '<li class="list-group-item"><iframe src="http://www.giantbomb.com/portal/3030-' + data.id + '/" height="600" width="100%"></iframe>';
			text += '</ul>';
			$("#gameList").append(text);
			// $("#gamePage").append(text);
		}
	});
}

function searchDeveloper(developers) {
	$.post("http://localhost:3000/searchDevelopers", {
		"developer": developers
	}, function (data) {
		renderTable(data, developers, "Developer");
	});
}

function searchTheme(theme) {
	$.post("http://localhost:3000/searchTheme", {
		"theme": theme
	}, function (data) {
		renderTable(data, theme, "Theme")
	});
}

function searchConcept(concept) {
	if (concept == "Winners Don't Use Drugs") {
		concept = '"Winners Don\'t Use Drugs"';
	}

	if (concept == "Games That Ask You to Press Start But Will Accept Other Buttons") {
		concept = 'Games That Ask You to \"Press Start\" But Will Accept Other Buttons';
	}

	$.post("http://localhost:3000/searchConcept", {
		"concept": concept
	}, function (data) {
		renderTable(data, concept, "Concept")
	});
}

function renderTable(data, name, type) {
	$gamesList = data;
	$("#gameList").empty();
	type = type + ": ";
	var text = '<h1 style="color:#dd4814">' + type + name + '</h1><br><table width="100%" class="table text-center table-hover" id="filteredTable">';
	if (data.length != 0) {
		text += '<input type="checkbox" id="onlyOwnedGames" > <label for="onlyOwnedGamescbox">Only List Games You Own (beta)</label>';
		text += '<thead><tr><th class="text-center">Game Art</th>';
		text += '<th class="text-center">Giant Bomb ID</th>';
		text += '<th class="text-center">Title</th>';
		text += '<th class="text-center">Description</th>';
		text += '<th class="text-center">Launch Game</th>';



		$("#gameList").append(text);
		$('#filteredTable').DataTable({
			"processing": true,
			"serverSide": false,
			"order": [
				[4, "desc"]
			],
			"data": data,
			"columnDefs": [{
				"targets": [0],
				"searchable": false,
				"data": "img_logo_url",
				"render": function (data, type, row) {
					if(row["id"] && data)
						return '<a href=# onclick="viewGame(' + row["steamAppId"] + ')"><img class="img box-shadow--6dp" src="http://media.steampowered.com/steamcommunity/public/images/apps/' + row["steamAppId"] + '/' + data + '.jpg"/</a>'; //gbGame art';
					else
						return "No Image Found."
				}
			},  {
				"targets": [1],
				"searchable": false,
				"data": "id"
			}, {
				"targets": [2],
				"data": "name",
				"render": function (data, type, row) {
					var nameNoSpace = data.replace(/ /g, "+");
					return '<a href="http://www.giantbomb.com/search/?q=' + nameNoSpace + '" target="_blank">' + data + '</a>';
				}
			}, {
				"targets": [3],
				"searchable": false,
				"data": "deck"
			}, {
				"targets": [4],
				"searchable": false,
				"data": "steamAppID",
				"render": function (data, type, row) {
					return '<a href="steam://run/' + data + '"><button type="button" class="btn btn-primary btn-lg">Launch Game</button>';
				}

			}]
		});
	}

}

function searchGenre(genre) {
	$.post("http://localhost:3000/searchGenre", {
		"genre": genre
	}, function (data) {
		renderTable(data, genre, "Genre");
	});
}
