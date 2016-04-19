var $currentUserSteam = ""; 
var $currentUsername = "";
var $steamAPI = "";
var $giantBombAPI = "";

$(document).ready(function() {
	"use strict";

	if($currentUserSteam == ""){
		$("#update").hide();
		$("#logOut").hide();
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

	$("#gbUpdate").click(function() {
		$.post("http://localhost:3000/gbAll", {}, function(data){});
	});

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

	$("#registerButton").click(function() {
		var registrationData = _.object($("#registerSignIn-form").serializeArray().map(function(v) {return [v.name, v.value];} ));  //returns form values as key value pairs
		$.post("http://localhost:3000/exists", {"username": registrationData.email.toLowerCase()}, function(data) {
				if(data.length != 0){
		    		$("#errorMsg2").text("Sign up failed. Account already exists, please try again!");
			    	$("#errorMsg2").effect("shake");
			}
			else{
				$.post("http://localhost:3000/signup", {"username": registrationData.email.toLowerCase(), "password": registrationData.password, "steamID" : registrationData.steamID}, function(data) { 
		        	$("#registerSignIn").modal("hide");
			        $("#inputEmail").val("");
			        $("#inputPassword").val("");
			        $("#inputSteamID").val("");
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
		if($currentUserSteam != ""){
			$.post("http://localhost:3000/update", { "steamID": $currentUserSteam}, function(data) {
				if(data.length != 0){
					var text = $currentUsername+' Steam Games: <br><table class="table text-center table-hover">';
					for(var i = 0; i < data.games.length; i++){
						text += '<tbody><tr><td><img class="img-thumbnail" src="http://media.steampowered.com/steamcommunity/public/images/apps/'+data.games[i].appid+'/'+data.games[i].img_logo_url+'.jpg"/>';
						var qouted = data.games[i].name;
						qouted = qouted.replace(/ /g, "+");
						//text += '<td><a href="http://www.giantbomb.com/api/search/?api_key='+$giantBombAPI+'&format=json&resources=game&query='+qouted+'" target="_blank">'+data.games[i].name+'</a>';
						text += '<td id="'+data.games[i].appid+'"><a onclick="matchGame(\''+data.games[i].name+'\','+data.games[i].appid+')" href="javascript:void(0)">'+data.games[i].name+'</a>';
						text += '<td>'+data.games[i].playtime_forever+' minutes';
						text += '<td><a href="steam://run/'+data.games[i].appid+'"<button type="button" class="btn btn-primary btn-lg">Launch Game</button>'
					}
					$("#gameList").append(text);
				}
			});
		}	
	}

	$("#update").click(function() {
		showSteamGames();
	});
	
	$("#logOut").click(function() {
	    $currentUsername = "";
	    $currentUserSteam = "";
        $("#signup").show();
        $("#signin").show();
        $("#logOut").hide();
	    $("#greeting").remove();
  	});
});

function matchGame($gameName, $appid){
		console.log($gameName);
		$.post("http://localhost:3000/match", {"name": "/"+$gameName+"/"}, function(data) {
			console.log(data.description);
			$("#"+$appid).append(data.description);
		});
}