var $currentUserSteam = ""; 
var $currentUsername = "";
var $steamAPI = "";
var $giantBombAPI = "";

$(document).ready(function() {
	"use strict";

	var initialLoad = false;
	if(!initialLoad){
		makeHome();
		initialLoad = true;
	}

	if($currentUserSteam == ""){
		$("#update").hide();
		$("#logOut").hide();
		$("#getList").hide();
	}

	if($giantBombAPI == ""){
		$("#apiModal").modal();
	}

	$("#setupButton").click(function() {
		var apiData = _.object($("#apiModal-form").serializeArray().map(function(v) {return [v.name, v.value];} ));
		$steamAPI = apiData.steamAPIModal;
		$giantBombAPI = apiData.giantBombAPIModal;
		var $greeting = '<span class="text-primary" id="greeting">Steam API: ' + $steamAPI +'<br> Giant Bomb API: '+ $giantBombAPI +'</li>';
		$("#apiList").append($greeting);
		$.post("http://localhost:3000/API", {"steamAPI": apiData.steamAPIModal, "giantBombAPI": apiData.giantBombAPIModal}, function(data){});
		$("#apiModal").modal("hide");
	});

	//$("#gbUpdate").click(function() {
	//	$.post("http://localhost:3000/gbAll", {}, function(data){});
	//});

	$("#signup").click(function() {
		$("#signinButton").hide();
		$("#registerButton").show();
		$("#inputDIVSteamID").show();
		$("#registerSignin-title").empty().append("Sign Up");
		$("#registerSignIn").modal();
		$("#errorMsg2").text("");
	});

	$("#signin").click(function() {
		$("#registerButton").hide();
		$("#signinButton").show();
		$("#inputDIVSteamID").hide();
		$("#registerSignin-title").empty().append("Sign In");
		$("#registerSignIn").modal();
		$("#errorMsg2").text("");
	});

	$("#home").click(function() {
		makeHome();
	});

	$("#brand").click(function() {
		makeHome();
	});

	$("#searchGenre").click(function() {
		$("#gameList").empty();		

		$.get("http://localhost:3000/getGenres", function(data) {
			if(data.length != 0){
				data = _.sortBy(data);
				var text = '<div class="container">';

				text += '<div class="col-lg-12"><h1 class="page-header">Choose a Genre</h1></div>'
				text += '<table class="table"><tbody>'
				text += '<tr>'
				for(var i = 0; i < data.length; i++){
					var noSingleQ = data[i].replace(/'/g, "\\\'");
					text += '<td><button onclick="searchGenre(\''+noSingleQ+'\')" type="button" class="btn btn-primary btn-lg btn-block">'+data[i]+'</button></a>'
					if (((i+1)%5) == 0){
						text += '<tr>'
					}
				}
				$("#gameList").append(text);
			}				
		});
	});

	$("#searchConcept").click(function() {
		$("#gameList").empty();		

		$.get("http://localhost:3000/getConcepts", function(data) {
			if(data.length != 0){
				data = _.sortBy(data);
				var text = '<div class="container">';

				text += '<div class="col-lg-12"><h1 class="page-header">Choose a Concept</h1></div>'
				text += '<table class="table"><tbody>'
				text += '<tr>'
				for(var i = 0; i < data.length; i++){
					var noSingleQ = data[i].replace(/'/g, "\\\'");
					noSingleQ = noSingleQ.replace(/"/g, "");
					text += '<td><button onclick="searchConcept(\''+noSingleQ+'\')" type="button" class="btn btn-primary btn-sm btn-block">'+data[i]+'</button></a>'
					if (((i+1)%3) == 0){
						text += '<tr>'
					}
				}
				$("#gameList").append(text);
			}				
		});
	});

	$("#registerButton").click(function() {
		var registrationData = _.object($("#registerSignIn-form").serializeArray().map(function(v) {return [v.name, v.value];} ));  //returns form values as key value pairs
		$.post("http://localhost:3000/exists", {"username": registrationData.email.toLowerCase()}, function(data) {
			if(data.length != 0){
		    	$("#errorMsg2").text("Sign up failed. Account already exists, please try again!");
			    $("#errorMsg2").effect("shake");
			}
			else{
				$.post("http://localhost:3000/signup", {"username": registrationData.email.toLowerCase(), "password": registrationData.password, "steamID" : registrationData.steamID}, function(data) { 
			        $("#inputEmail").val("");
			        $("#inputPassword").val("");
			        $("#inputSteamID").val("");
			        $("#registerSignIn").modal("hide");
		    	});
			}
		});
	});

  	$("#signinButton").click(function() {
	    var signinData = _.object($("#registerSignIn-form").serializeArray().map(function(v) {return [v.name, v.value];} ));//converts form data to associative array
	    $.post("http://localhost:3000/signin", { "username": signinData.email.toLowerCase(), "password": signinData.password }, function(data) {
       		if(data.length != 0){
	        	$currentUsername = data[0].username;
	        	$currentUserSteam = data[0].steamID;

	        	$("#registerSignIn").modal("hide");
		        $("#inputEmail").val("");
		        $("#inputPassword").val("");
		        $("#inputSteamID").val("");
		        $("#signup").hide();
		        $("#signin").hide();
		        $("#logOut").show();
		        $("#update").show();
		        $("#getList").show();
		        var $greeting = '<span class="text-primary" id="greeting">Hello, ' + $currentUsername +'!</li>';
		        $("#navbar").append($greeting);
		        showSteamGames();
       		}
       		else{     			
		    	$("#errorMsg2").text("Sign in failed. Account not found or wrong password!");
		    	$("#errorMsg2").effect("shake");
       		}
	    });
  	});
	
	function showSteamGames(){
		$("#gameList").empty();		
		if($currentUserSteam != ""){
			$.post("http://localhost:3000/getSteamList", { "steamID": $currentUserSteam}, function(data) {
				data[0].games = _.sortBy(data[0].games,"playtime_forever");
				data[0].games = data[0].games.reverse();
				if(data.length != 0){
					var text = $currentUsername+' Steam Games: <br><table class="table text-center table-hover">';
					text += '<thead><tr><th class="text-center">Game Art</th>';
					text += '<th class="text-center">Steam Appid</th>';
					text += '<th class="text-center">Giant Bomb ID</th>';
					text += '<th class="text-center">Title (Click to search Giant Bomb)</th>';
					text += '<th class="text-center">Play Time</th>';
					text += '<th class="text-center">Launch Game</th>';
					for(var i = 0; i < data[0].games.length; i++){
						text += '<tbody><tr>'
						text += '<td><a href=# onclick="view('+data[0].games[i].giantBombID+')"><img class="img-thumbnail" src="http://media.steampowered.com/steamcommunity/public/images/apps/'+data[0].games[i].appid+'/'+data[0].games[i].img_logo_url+'.jpg"/</a>';
						text += '<td>'+data[0].games[i].appid;
						text += '<td>'
						if(data[0].games[i].giantBombID != 0){
							text +='<a href="http://www.giantbomb.com/game/3030-'+data[0].games[i].giantBombID+'/" target="_blank"><button type="button" class="btn btn-primary">GB ID: '+data[0].games[i].giantBombID+'</button>'
						}
						text += '<label id="table'+data[0].games[i].appid+'" for="'+data[0].games[i].appid+'"><small>Enter Giant Bomb ID: </small></label><input id="input'+data[0].games[i].appid+'"type="text" class="form-control input-sm" id="gbID">'
						text += '<button onclick="match('+data[0].games[i].appid+')" type="button" class="btn btn-primary btn-sm">Submit ID</button>';
						var nameNoSpace = data[0].games[i].name.replace(/ /g, "+");					
						text += '<td><a href="http://www.giantbomb.com/search/?q='+nameNoSpace+'" target="_blank">'+data[0].games[i].name+'</a>';
						text += '<td>'+data[0].games[i].playtime_forever+' minutes';
						text += '<td><a href="steam://run/'+data[0].games[i].appid+'"><button type="button" class="btn btn-primary btn-lg">Launch Game</button>'
					}
					$("#gameList").append(text);
				}
			});
		}	
	}

	$("#update").click(function() {
		$.post("http://localhost:3000/update", { "steamID": $currentUserSteam}, function(data) {
			showSteamGames();
		});		
	});

	$("#getList").click(function() {
		showSteamGames();	
	});
	
	$("#logOut").click(function() {
	    $currentUsername = "";
	    $currentUserSteam = "";
        $("#signup").show();
        $("#signin").show();
        $("#logOut").hide();
        $("#update").hide();
        $("#getList").hide();
	    $("#greeting").remove();
	    $("#gameList").empty();
	    makeHome();
  	});
});

function match($appID){
	if ($appID != ""){
		var temp = $("#input"+$appID).val();
		$("#table"+$appID).empty();
		var text = '<a href="http://www.giantbomb.com/game/3030-'+temp+'/" target="_blank"><button type="button" class="btn btn-primary">Giant Bomb Page</button>'
		$("#table"+$appID).append(text);
		$.post("http://localhost:3000/match", {"steamAppID": parseInt($appID), "giantBombID": parseInt(temp)}, function(data) {
		});
	}
}

function searchGenre(genre){
	$.post("http://localhost:3000/searchGenre", {"genre": genre}, function(data) {
		$("#gameList").empty();
		if(data.length != 0){
			data = shuffle(data);
			var text = '<h1>Genre: '+genre+'</h1><br><table class="table text-center table-hover">';
					text += '<thead><tr><th class="text-center">Game Art</th>';
					text += '<th class="text-center">Giant Bomb ID</th>';
					text += '<th class="text-center">Title</th>';
					text += '<th class="text-center">Description</th>';
					text += '<th class="text-center">Launch Game</th>';
			for(var i = 0; i< data.length; i++){
				text += '<tbody><tr><td><a href=# onclick="view('+data[i].id+')"><img class="img-thumbnail box-shadow--6dp" src="'+data[i].image.small_url+'" height="300" width="300"></a>';
				text += '<td>'+data[i].id;
				text += '<td>'+data[i].name;
				text += '<td>'+data[i].deck;
				text += '<td><a href="steam://run/'+data[i].steamAppID+'"><button type="button" class="btn btn-primary btn-lg">Launch Game</button>'
			}
			$("#gameList").append(text);
		}
	});
}

function searchConcept(concept){
	$.post("http://localhost:3000/searchConcept", {"concept": concept}, function(data) {
		$("#gameList").empty();
		if(data.length != 0){
			data = shuffle(data);
			var text = '<h1>Concept: '+concept+'</h1><br><table class="table text-center table-hover">';
					text += '<thead><tr><th class="text-center">Game Art</th>';
					text += '<th class="text-center">Giant Bomb ID</th>';
					text += '<th class="text-center">Title</th>';
					text += '<th class="text-center">Description</th>';
					text += '<th class="text-center">Launch Game</th>';
			for(var i = 0; i< data.length; i++){
				text += '<tbody><tr><td><a href=# onclick="view('+data[i].id+')"><img class="img-thumbnail box-shadow--6dp" src="'+data[i].image.small_url+'" height="300" width="300"></a>';
				text += '<td>'+data[i].id;
				text += '<td>'+data[i].name;
				text += '<td>'+data[i].deck;
				text += '<td><a href="steam://run/'+data[i].steamAppID+'"><button type="button" class="btn btn-primary btn-lg">Launch Game</button>'
			}
			$("#gameList").append(text);
		}
	});
}

function makeHome(){
	$.get("http://localhost:3000/makeHome", function(data) {
		$("#gameList").empty();
		if(data.length != 0){
			data = shuffle(data);
			var text = "";
			for(var i = 0; i< data.length; i++){
				text += '<a href=# onclick="view('+data[i].id+')"><img class="img-thumbnail" src="'+data[i].image.icon_url+'" height="80" width="80" title="'+data[i].name+'">';
			}
			$("#gameList").append(text);
		}
	});
}

function view(id){
	$.get("http://localhost:3000/game/"+id, function(data) {
		if(data.length != 0){
			$("#gameList").empty();
			var text = '<ul class="list-group"><li class="list-group-item"><h1 style="color:#dd4814">'+data[0].name+'';
			text += '<li class="list-group-item"><img class="img-thumbnail box-shadow--8dp" src="'+data[0].image.super_url+'" title="'+data[0].name+'">';
			text += '<li class="list-group-item"><a href="steam://run/'+data[0].steamAppID+'"><button type="button" class="btn btn-success btn-lg">Launch Game On Steam</button></a>'
			text += '<li class="list-group-item"><h2>Giant Bomb Game Information';
			text += '<li class="list-group-item"><iframe src="http://www.giantbomb.com/portal/3030-'+data[0].id+'/" height="600" width="100%"></iframe>'
			text += '</ul>'
			$("#gameList").append(text);
		}
	});
}