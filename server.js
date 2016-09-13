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
var mongojs = require('mongojs');
var parseString = require('xml2js').parseString;

var db = mongojs('wsip');
var users = db.collection('users');
var userGames = db.collection('userGames');
var giantBombDatabase = db.collection('GBDB');
var sToGB = db.collection('sToGB');
var steamUsersDB = db.collection('steam_users');

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
                request({url: url1, json: true}, function (error, response, body) {
                    parseString(body, function (err, result) {
                        if(typeof result.response == 'undefined'){
                            steamUsersDB.insert({steam_id: result.profile.steamID64[0], steam_name: req.body.steamName }, function(err, r) {
                                if(err == null) {
                                    req.session.steamID = result.profile.steamID64[0];
                                    req.session.steamName = req.body.steamName;
                                    // res.json({steamID: result.profile.steamID64[0], steamName: req.body.steamName});
                                } else {
                                    res.json({"err": err});
                                }
                            })
                        }
                        else{
                            res.json({"err": result.response.error});
                        }

                    });
                });
            } else {
                //if its all numbers then its the id itself
                req.session.steamID = req.body.steamName;
                req.session.steamName = req.body.steamName;
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

function getOwnedGames(steamID, callback) {
    var url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key="+ process.env.STEAM_API_KEY+"&steamid="+steamID+"&include_appinfo=1&format=json";
    request({url: url, json: true}, function (error, response, body) {
        if (error == null && response.statusCode === 200) {
            var tempSteam = body.response;
            steamUsersDB.findAndModify({
                query: {steam_id: steamID},
                update: {$set:tempSteam },
                new: true
            }, function(err, doc, lastErrorObject) {
                if(err == null) {
                    callback(doc);

                } else {
                    console.log("ERROR:"+err);
                    res.json({"err": err});
                }
            });
        }
        else{
            console.log("ERROR:"+error);
            res.json({"err": error});
            //todo if failed to return
        }
    });
}

app.post('/test', urlencodedParser, function(req,res){ //this is to test the checkgameonGB function
    if (!req.body.steamName) return res.sendStatus(400);



    steamUsersDB.find({steam_name: req.body.steamName }, function (err, docs) {
        if(err == null && docs.length >0) //if the user is already in the database, set session and update owned games
        {//todo
            checkGameOnGB(docs[0].games, docs[0].steam_id, function (doc) {
                res.json(docs[0].games);
            });

        }
    });
});

//takes in a list of users games/ checks if games are in gbdb and if not go to
function checkGameOnGB(users_games, steam_id, callback) {
    updateOneGame(users_games, steam_id, 0);

}

function updateSteamGames(steam_id, users_games, callback) {
    steamUsersDB.findAndModify({
        query: {steam_id: steam_id},
        update: {$set: {games: users_games}}
    }, function (err, doc, lastErrorObject) {
        if (err == null) {
            callback(doc);

        } else {
            console.log("ERROR:" + err);
            res.json({"err": err});
        }
    });
}
function updateOneGame(users_games, steam_id, i, callback) {//need betterfunction name
    giantBombDatabase.findOne({steamAppID: users_games[i].appid.toString()}, function (err, doc) { //check if gbGame exists in gbdb by appid
        if(err == null && doc != null) {

            if(!users_games[i].deck) {
                //add deck to user games
                //todo: add deck to users games
                // steamUsersDB.findAndModify({
                //     query: {steam_id: steamID},
                //     update: {$set:doc.deck },
                //     new: true
                // }, function(err, doc, lastErrorObject) {
                //     if(err == null) {
                //         callback(doc);
                //
                //     } else {
                //         console.log("ERROR:"+err);
                //         res.json({"err": err});
                //     }
                // });
            }


        } else if(err != null){
            console.log("ERROR:"+err);
            res.json({"err": err});
        } else {
            //TODO go on giant bomb to get the info
            var gameName = users_games[i].name;
            steamNameToGBName(users_games[i].name, function(gbGameName) {
               if(gbGameName != null)
                   gameName = gbGameName;
                var noSpace = gameName.replace(/ /g,"+");
                var url = 'http://www.giantbomb.com/api/search/?api_key='+process.env.GB_API_KEY+'&format=json&limit=10&query='+noSpace+'&resources=gbGame';

                request({url: url, json: true, timeout:10000, headers: {'User-Agent': 'whatShouldIPlay'}}, function (error, response, body) {
                    //TODO error check
                    //TODO: make sure its has pc in the platform
                    //TODO: make sure names match exactly maybe strip out non alphanumeric chars or something
                    //counter-strike should be halflife counter stirke
                    //insert logic to find correct gbGame
                    for(gbGame in body.results) {
                        for(platform in gbGame.platforms) {
                            if(platform.name === "PC") {
                                //insert deck to steam games
                                insertGBGamePage(gbGame.api_detail_url, users_games[i].appid.toString());
                                users_games[i].deck = gbGame.deck;
                                //TODO WORK ON THIS
                                updateSteamGames(steam_id, users_games, callback);
                            }
                        }
                    }

            });



                // res.json({'appID': body.results[0].id});
            });
        }
    });
}

function insertGBGamePage(api_detail_url, app_id) {
    request({url: api_detail_url, json: true, timeout:10000, headers: {'User-Agent': 'whatShouldIPlay'}}, function (error, response, body) {
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
        }, function(err, r) {
            if(err == null) {
                callback();
            } else {
                res.json({"err": err});
            }
        });
    });

}

function steamNameToGBName(gameName, callback) { //list of custom names for giant bomb
    var names = {
        "counter-strike": "half life: counter-strike"
    };
    callback(names[gameName.toLowerCase()]);
}




function sendError(err) {//TODO: unfinished
    console.log("ERROR:"+err);
    res.json({"err": err});
}

app.post('/update', urlencodedParser, function(req,res){
    var steamID = req.body.steamID;

    var url2 = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key="+ process.env.STEAM_API_KEY+"&steamid="+steamID+"&include_appinfo=1&format=json";
    request({url: url2, json: true}, function (error, response, body) {
        if (error == null && response.statusCode === 200) {
            var tempSteam = body.response;
            tempSteam.steamID = steamID;

            updateStoGB(tempSteam, tempSteam.game_count, res);
        }
        else{
            console.log("ERROR:"+error);
        }
    });
});

function updateStoGB(tempSteam, gameCount, res){ //looks up giantbomb ID and adds it to
    i = 0;
    (function updateOne() {
        sToGB.find({steamAppID: tempSteam.games[i].appid.toString()}, function (err, docs) {
            if(docs.length != 0){
                tempSteam.games[i].giantBombID = docs[0].giantBombID.toString();
            }
            else{
                tempSteam.games[i].giantBombID = 0;
            }
            i++;
            if(i < gameCount){
                updateOne();
            }
            else{
                userGames.update({"steamID": tempSteam.steamID},tempSteam, {upsert: true}, function (err, docs) {
                    res.sendStatus(200);
                });
            }            
        });
    })();
}

function bestMatch(steamName, res){
    var noSpace = steamName.replace(/ /g,"+");
    var url = 'http://www.giantbomb.com/api/search/?api_key='+process.env.GB_API_KEY+'&format=json&query='+noSpace+'&resources=gbGame';
    request({url: url, json: true}, function (error, response, body) {
        res.json({'appID': body.results[0].id});
    });
}

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
        var url = 'http://www.giantbomb.com/api/gbGame/3030-'+req.body.giantBombID+'/?api_key='+process.env.GB_API_KEY+'&format=json';
        request({url: url, json: true,}, function (error, response, body){
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

app.get('/gbGame/:id',urlencodedParser, function(req,res){
    giantBombDatabase.find({'id': parseInt(req.params.id)}, function (err, docs) {
         res.json(docs);
    });
});