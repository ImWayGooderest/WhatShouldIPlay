var dotenv = require('dotenv').config(),
    express = require("express"),
    request = require("request"),
    http = require("http"),
    bodyParser = require('body-parser'),
    app = express(),
    session = require('express-session'),
    cookieParser = require("cookie-parser"),
    bcrypt = require('bcrypt'),
    morgan = require('morgan');

app.use(morgan('dev'));
const saltRounds = 10;
const gbTimeBtwnRequests = 18000;
var gbSearchlock = false;
var mongojs = require('mongojs');
var parseString = require('xml2js').parseString;
var db = mongojs('wsip');
var users = db.collection('users');
var userGames = db.collection('userGames');
var giantBombDatabase = db.collection('GBDB');
var sToGB = db.collection('sToGB');
var steamUsersDB = db.collection('steam_users');
var gamesNotFoundDB = db.collection('games_not_found');
app.use(express.static(__dirname));
// Create our Express-powered HTTP server
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(3000, function() {
    console.log('App listening on port 3000!');
});

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
var jsonParser = bodyParser.json();

var errors = [];
app.use(cookieParser());
app.use(session({secret: process.env.SECRET,
    saveUninitialized: true,
    resave: true
}));


app.get('/getUsername', urlencodedParser, function(req,res) {
    if(req.session.steamID ) {
        res.json({"steamID": req.session.steamID, "username": req.session.steamName }); //TODO: send back list of games too
    } else {
        res.json({"steamID": ""});
    }
});
app.post('/signup',function(req,res){  //will be used only for admin accounts in the future
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if(err === undefined) {
            req.body.password = hash;
            users.save(req.body);
            res.sendStatus(200);
        } else {
            console.log("ERROR:"+err);
            res.sendStatus(500);
            //TODO: send error message
        }

    });


});

app.post('/exists',function(req,res){  //TODO:will be used only for admin accounts in the future
    users.find(req.body, function(err, doc){
        if(doc != null){
            res.json(doc);
        }
    });

});

app.post('/signin',function(req,res){  //TODO: w ill be used only for admin accounts in the future

    users.find({"username": req.body.username}, function(err, doc){
        if(doc.length > 0){

            bcrypt.compare(req.body.password, doc[0].password, function(err, isMatching) {
                if(isMatching == true) {
                    var userInfo = {"username": doc[0].username, "steamID": doc[0].steamID};
                    res.json(userInfo);
                } else {
                    res.json({"err": "Sign in failed. Account not found or wrong password!"});
                }
            });

        } else {
        res.json({"err": "Sign in failed. Account not found or wrong password!"});
    }
    });
});


app.post('/lookupID64', urlencodedParser, function(req,res){
    if (!req.body.steamName) return res.sendStatus(400);
    req.body.steamName  = req.body.steamName.toLowerCase();
    // check if steam name is in database
    steamUsersDB.find({steam_name: req.body.steamName }, function (err, docs) {
        if(err == null && docs.length >0) //if the user is already in the database, set session and update owned games
        {//todo
            req.session.steamID = docs[0].steam_id;
            req.session.steamName = docs[0].steam_name;
            getOwnedGames(req.session.steamID, function (doc) {
                res.json(doc);
            });

        } else {
            var url1 = "";
            if(isNaN(req.body.steamName)) {
                url1 = 'http://steamcommunity.com/id/'+req.body.steamName+'/?xml=1';
                request({url: url1}, function (error, response, body) {
                    parseString(body, function (err, result) {
                        if(typeof result.response == 'undefined'){
                            insertUserAndSetSession(req, result.profile.steamID64[0], req.body.steamName, function(err) {
                                if(err != null)
                                    res.json({"err": err});
                            });
                        }
                        else{
                            res.json({"err": result.response.error});
                        }

                    });
                });
            } else {
                //if its all numbers then its the id itself
                insertUserAndSetSession(req, req.body.steamName, req.body.steamName, function(err) {
                    if(err != null)
                        res.json({"err": err});
                });
                // res.json({steamID: result.profile.steamID64[0], steamName: req.body.steamName});
            }

            if(req.session.steamID != null) {
                getOwnedGames(req.session.steamID, function (doc) {
                    res.json(doc);
                }); //send back username and games
            }

        }
    });




});



// app.post('/test', urlencodedParser, function(req,res){ //this is to test the checkgameonGB function
//     if (!req.body.steamName) return res.sendStatus(400);
//
//
//
//     steamUsersDB.find({steam_name: req.body.steamName }, function (err, docs) {
//         if(err == null && docs.length >0) //if the user is already in the database, set session and update owned games
//         {//todo
//             checkGameOnGB(docs[0].games, docs[0].steam_id, function (updated_users_games) {
//                 res.json(updated_users_games);
//
//             });
//
//         }
//     });
// });

app.post('/bestMatch',urlencodedParser, function(req,res){
    bestMatch(req.body.steamName, res);
});

app.post('/getSteamList',urlencodedParser, function(req,res){
    userGames.find({"steamID": req.body.steamID}, function (err, docs) {
        res.json(docs);
    });
});

app.post('/match',urlencodedParser, function(req,res){
    tempSteamID = req.body.steamAppID;
    sToGB.update({"steamAppID": req.body.steamAppID}, req.body, {upsert: true},function (err, docs) {
        var url = 'http://www.giantbomb.com/api/game/3030-'+req.body.giantBombID+'/?api_key='+process.env.GB_API_KEY+'&format=json';
        request({url: url, json: true}, function (error, response, body){
            if (body.results.steamAppID != null){
                body.results.steamAppID = tempSteamID;
                giantBombDatabase.update({"id": body.results.id},body.results, {upsert: true});
            }
            res.sendStatus(200);
        });     
    });   
});



app.get('/getGenres',urlencodedParser, function(req,res){
    giantBombDatabase.distinct('genres.name',{}, function (err, docs) {
         res.json(docs);
    });
});

app.get('/getConcepts',urlencodedParser, function(req,res){
    giantBombDatabase.distinct('concepts.name',{}, function (err, docs) {
         res.json(docs);
    });
});

app.get('/getThemes',urlencodedParser, function(req,res){
    giantBombDatabase.distinct('themes.name',{}, function (err, docs) {
         res.json(docs);
    });
});


app.get('/getDevelopers',urlencodedParser, function(req,res){
    giantBombDatabase.distinct('developers.name',{}, function (err, docs) {
         res.json(docs);
    });
});

app.post('/searchGenre',urlencodedParser, function(req,res){
    giantBombDatabase.find({'genres.name': req.body.genre}, function (err, docs) {
         res.json(docs);
    });
});

app.post('/searchConcept',urlencodedParser, function(req,res){
    giantBombDatabase.find({'concepts.name': req.body.concept}, function (err, docs) {
         res.json(docs);
    });
});

app.post('/searchDevelopers',urlencodedParser, function(req,res){
    giantBombDatabase.find({'developers.name': req.body.developer}, function (err, docs) {
         res.json(docs);
    });
});

app.post('/searchTheme',urlencodedParser, function(req,res){
    giantBombDatabase.find({'themes.name': req.body.theme}, function (err, docs) {
         res.json(docs);
    });
});

app.get('/makeHome',urlencodedParser, function(req,res){
    giantBombDatabase.find({},{'image.super_url': 1, 'image.icon_url': 1, 'id': 1, 'name': 1}, function (err, docs) {
        res.json(docs);
    });
});

app.get('/game/:id',urlencodedParser, function(req,res){
    giantBombDatabase.find({'id': parseInt(req.params.id)}, function (err, docs) {
         res.json(docs);
    });
});


//takes in a list of users games/ checks if games are in gbdb and if not go to
//loop goes checkGameOnGB->findGameInGBDB->insertGBPage(if applicable)->checkGameOnGB
//instertGbInfoToSteam
function checkGameOnGB(users_games, steam_id, callback) {
    var i=0;
    var gameCount = users_games.length;
    var gamesNeedUpdate = [];
    (function updateOne() {
        findGameInGBDB(users_games[i], steam_id, function(updated_users_game, not_updated_game,  err){
            if(err == undefined) {
                users_games[i] = updated_users_game;

            }
            if(not_updated_game) {
                var timeInMss = Date.now();
                gamesNotFoundDB.findOne({name: not_updated_game.name}, function(err, doc){
                    if(!doc) {
                        gamesNotFoundDB.insert({name: not_updated_game.name, time: timeInMss}, function(err, doc){
                            gamesNeedUpdate.push(not_updated_game);
                        });
                    } else if((Math.floor((timeInMss - doc.time)/1000)) > 864000 ) { //if it hasn't been updated in 10 days
                        gamesNotFoundDB.insert({name: not_updated_game.name, time: timeInMss}, function(err, doc){
                            gamesNeedUpdate.push(not_updated_game);
                        });
                    }
                });

            }
            i++;

            if(i < gameCount) {
                updateOne()
            } else {
                insertGbInfoToSteam(steam_id, users_games, function(result) {
                    callback(result);
                });
                if(gamesNeedUpdate.length > 0 && !gbSearchlock) {
                    gbSearchlock = true;
                    getGBinfo(steam_id, gamesNeedUpdate, function(){
                        gbSearchlock = false;
                    });
                }

            }


        });
    })();
}


function getGBinfo(steam_id, gamesNeedUpdate, callback) {
    //make iterative
    //TODO: NEED TO WORK ON 9/16
    var i = 0;
    var gameCount = gamesNeedUpdate.length;
    (function gbUpdateOne() {
        steamNameToGBName(gamesNeedUpdate[i].name, function(gbGameName) {
            var noSpace = gbGameName.replace(/ /g, "+");
            var url = 'http://www.giantbomb.com/api/search/?api_key=' + process.env.GB_API_KEY + '&format=json&limit=10&query=' + noSpace + '&resources=game';
            request({
                url: url,
                json: true,
                timeout: 20000,
                headers: {'User-Agent': 'whatShouldIPlay'}
            }, function (error, response, body) {
                //TODO error check
                //TODO: make sure names match exactly maybe strip out non alphanumeric chars or something
                //insert logic to find correct game
                if (error) {
                    addError(error);
                    i++;
                    if(i < gameCount) {
                        setTimeout(function(){gbUpdateOne()}, gbTimeBtwnRequests);
                        // } else {
                        //     callback(gamesNeedUpdate[i]);
                        // }

                    } else {
                        callback()
                    }
                } else if (body.results.length > 0) {
                    var found = false;
                    for (var gCount = 0; gCount < body.results.length; gCount++) { //find the first game result with PC
                        if(body.results[gCount].platforms != null) {
                            for (var pCount = 0; pCount < body.results[gCount].platforms.length; pCount++) {
                                if (body.results[gCount].platforms[pCount].name === "PC") {
                                    //insert deck to steam games
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if (found)
                            break;
                    }
                    if (gamesNeedUpdate[i].appid != null) {
                        if(!found) { //if no pc version found just insert top result
                            gCount = 0;
                        }
                        insertGBGamePage(body.results[gCount].api_detail_url, gamesNeedUpdate[i].appid.toString(), function (themes, genres, detail_url, err) {
                            if (!err) {
                                console.log("successfully inserted "+ gamesNeedUpdate[i].name + "\n");
                                gamesNeedUpdate[i].deck = body.results[gCount].deck;
                                gamesNeedUpdate[i].themes = themes;
                                gamesNeedUpdate[i].genres = genres;
                                gamesNeedUpdate[i].site_detail_url = detail_url;
                                steamUsersDB.findAndModify({
                                    query: {steam_id: steam_id,
                                        "games.$.appid": gamesNeedUpdate[i].appid},
                                    update: {$set: {"games.$": gamesNeedUpdate[i]}},
                                    new: true
                                }, function (err, doc, lastErrorObject) {
                                    i++;
                                    if (err == null) {

                                        if(i < gameCount) {
                                            setTimeout(function(){gbUpdateOne()}, gbTimeBtwnRequests);
                                            // } else {
                                            //     callback(gamesNeedUpdate[i]);
                                            // }

                                        } else {
                                            callback()
                                        }
                                    } else {
                                        addError(err);
                                        if(i < gameCount) {
                                            setTimeout(function(){gbUpdateOne()}, gbTimeBtwnRequests);
                                            // } else {
                                            //     callback(gamesNeedUpdate[i]);
                                            // }

                                        } else {
                                            callback()
                                        }
                                    }


                                });
                            } else {
                                i++;
                                if(i < gameCount) {
                                    setTimeout(function(){gbUpdateOne()}, gbTimeBtwnRequests);


                                } else {
                                    callback()
                                }
                            }
                        });
                    } else {
                        console.log("Could not find appid: "+ gamesNeedUpdate[i].name);
                        i++;
                        if(i < gameCount) {
                            setTimeout(function(){gbUpdateOne()}, gbTimeBtwnRequests);
                        } else {
                            callback()
                        }

                    }
                } else {
                    console.log("Could not find on giant bomb: "+ gamesNeedUpdate[i].name);
                    i++;
                    if(i < gameCount) {
                        setTimeout(function(){gbUpdateOne()}, gbTimeBtwnRequests);
                    }else {
                        callback()
                    }

                }
            });
        });

    })();


}
function findGameInGBDB(steam_game, steam_id, callback) {//need betterfunction name
    var gameName = steam_game.name;
    steamNameToGBName(steam_game.name, function(gbGameName) {
        if(gbGameName != null)
            gameName = gbGameName;

        giantBombDatabase.findOne({steamAppId: steam_game.appid.toString()}, function (err, doc) { //check if game exists in gbdb by appid
            if(err == null && doc != null) {

                if(!steam_game.deck) {
                    steam_game.deck = doc.deck;
                    steam_game.themes = doc.themes;
                    steam_game.genres = doc.genres;
                    steam_game.site_detail_url = doc.site_detail_url;
                }
                callback(steam_game);

            } else if(err != null){
                addError(err);
                callback("",err);
            } else {
                callback(steam_game, steam_game);
                // res.json({'appID': body.results[0].id});

            }
        });
    });

}

function insertGBGamePage(api_detail_url, app_id,  callback) {
    request({url: api_detail_url + '?api_key='+process.env.GB_API_KEY+'&format=json', json: true, timeout:10000, headers: {'User-Agent': 'whatShouldIPlay'}}, function (error, response, body) {
        if(!error && response.statusCode == 200 && body) {
            giantBombDatabase.insert({
                date_last_updated: body.results.date_last_updated,
                deck: body.results.deck,
                id: body.results.id,
                name: body.results.name,
                site_detail_url: body.results.site_detail_url,
                concepts: body.results.concepts,
                developers: body.results.developers,
                genres: body.results.genres,
                objects: body.results.objects,
                publishers: body.results.publishers,
                similar_games: body.results.similar_games,
                themes: body.results.themes,
                steamAppId: app_id
            }, function(err, doc) {
                if(err == null) {
                    callback(body.results.themes, body.results.genres, body.results.site_detail_url);
                } else {
                    addError(err)
                }
            });
        } else {
            addError(error);
            callback("","","",error);
        }

    });

}

function insertGbInfoToSteam(steam_id, users_games, callback) {
    steamUsersDB.findAndModify({
        query: {steam_id: steam_id},
        update: {$set: {games: users_games}},
        new: true
    }, function (err, doc, lastErrorObject) {
        if (err == null) {
            callback(doc);

        } else {
            addError(err);
        }
    });
}

function steamNameToGBName(gameName, callback) { //list of custom names for giant bomb
    var names = {
        "counter-strike": "half life: counter-strike",
        "call of duty 2 - multiplayer": "call of duty 2",
        "call of duty: advanced warfare - multiplayer": "call of duty: advanced warfare",
        "sid meier's civilization iii: complete": "sid meier's civilization iii",
        "bully: scholarship edition": "bully",
        "galactic civilizations ii: ultimate edition": "galactic civilizations ii",
        "injustice: gods among us ultimate edition": "injustice : gods among us",
        "mortal kombat komplete edition": "mk9",
        "burnout paradise: the ultimate box": "burnout paradise",
        "dirt 3 complete edition": "dirt 3",
        "batman: arkham asylum goty edition": "batman arkham asylum",
        "batman: arkham city goty": "batman arkham city",
        "call of duty: black ops - multiplayer": "call of duty: black ops",
        "call of duty: black ops ii - multiplayer": "call of duty: black ops ii",
        "call of duty: black ops ii - zombies": "call of duty: black ops ii",
        "call of duty: modern warfare 2 - multiplayer": "call of duty: modern warfare 2",
        "crysis 2 maximum edition": "crysis 2",
        "dota 2 test": "dota 2",
        "red orchestra 2: heroes of stalingrad - single player": "red orchestra 2",
        "rising storm/red orchestra 2 multiplayer": "red orchestra: rising storm",
        "left 4 dead 2 beta": "left 4 dead",
        "vietnam ‘65": "vietnam 65"
    };
    if(names[gameName.toLowerCase()]) {
        callback(names[gameName.toLowerCase()]);
    } else {
        callback(gameName.replace(/[^\w\s]/gi, ''));
    }

}




function addError(err) {//TODO: unfinished
    console.log("ERROR:"+err);
    errors.push(err);
}

function insertUserAndSetSession(req, steam_id, steam_name, callback) {
    steamUsersDB.insert({steam_id: steam_id, steam_name: steam_name}, function (err, r) {
        if (err == null) {
            req.session.steamID = steam_id;
            req.session.steamName = steam_name;
            // res.json({steamID: result.profile.steamID64[0], steamName: req.body.steamName});
        } else {
            callback(err);

        }
    });
}

function getOwnedGames(steamID, callback) { //only update playtime and games that arent there
    var url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key="+ process.env.STEAM_API_KEY+"&steamid="+steamID+"&include_appinfo=1&format=json";
    request({url: url, json: true}, function (error, response, body) {
        if (error == null && response.statusCode === 200) {
            var tempSteam = body.response;
            checkGameOnGB(tempSteam.games, steamID, function(doc){
                if(error == null) {
                    callback(doc);

                } else {
                    addError(error);
                    callback(error);
                }
            });
        }
        else{
            addError(error);
            callback(error);
            //todo if failed to return
        }
    });
}

function bestMatch(steamName, res){
    var noSpace = steamName.replace(/ /g,"+");
    var url = 'http://www.giantbomb.com/api/search/?api_key='+process.env.GB_API_KEY+'&format=json&query='+noSpace+'&resources=game';
    request({url: url, json: true}, function (error, response, body) {
        res.json({'appID': body.results[0].id});
    });
}