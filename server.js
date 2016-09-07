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
var giantBombDatabase = db.collection('giantBombDatabase');
var sToGB = db.collection('sToGB');

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

app.post('/exists',function(req,res){  //will be used only for admin accounts in the future
    users.find(req.body, function(err, doc){
        if(doc != null){
            res.json(doc);
        }
    });

});

app.post('/signin',function(req,res){  //will be used only for admin accounts in the future

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
    var url1 = "";
    if(!isNaN(req.body.steamName)) {
        url1 = 'http://steamcommunity.com/profiles/'+req.body.steamName+'/?xml=1';
    } else {
        url1 = 'http://steamcommunity.com/id/'+req.body.steamName+'/?xml=1';
    }
    request({url: url1, json: true}, function (error, response, body) {
        parseString(body, function (err, result) {
            if(result.profile != null){
                req.session.steamID = result.profile.steamID64;
                res.json(result.profile.steamID64);
            }
            else{
                res.json(["Not Found"]);
            }
            
        });
    });
});

app.post('/update',function(req,res){
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

function updateStoGB(tempSteam, gameCount, res){
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
    var url = 'http://www.giantbomb.com/api/search/?api_key='+process.env.GB_API_KEY+'&format=json&query='+noSpace+'&resources=game';
    request({url: url, json: true, headers: {'User-Agent': 'whatShouldIPlay'}}, function (error, response, body) {
        res.json({'appID': body.results[0].id});
    });
}

app.post('/bestMatch',function(req,res){
    bestMatch(req.body.steamName, res);
});

app.post('/getSteamList',function(req,res){
    userGames.find({"steamID": req.body.steamID}, function (err, docs) {
        res.json(docs);
    });
});

app.post('/match',function(req,res){
    tempSteamID = req.body.steamAppID;
    sToGB.update({"steamAppID": req.body.steamAppID}, req.body, {upsert: true},function (err, docs) {
        var url = 'http://www.giantbomb.com/api/game/3030-'+req.body.giantBombID+'/?api_key='+process.env.GB_API_KEY+'&format=json';
        request({url: url, json: true, headers: {'User-Agent': 'whatShouldIPlay'}}, function (error, response, body){
            if (body.results.steamAppID != null){
                body.results.steamAppID = tempSteamID;
                giantBombDatabase.update({"id": body.results.id},body.results, {upsert: true});
            }
            res.sendStatus(200);
        });     
    });   
});



app.get('/getGenres',function(req,res){
    giantBombDatabase.distinct('genres.name',{}, function (err, docs) {
         res.json(docs);
    });
});

app.get('/getConcepts',function(req,res){
    giantBombDatabase.distinct('concepts.name',{}, function (err, docs) {
         res.json(docs);
    });
});

app.get('/getThemes',function(req,res){
    giantBombDatabase.distinct('themes.name',{}, function (err, docs) {
         res.json(docs);
    });
});


app.get('/getDevelopers',function(req,res){
    giantBombDatabase.distinct('developers.name',{}, function (err, docs) {
         res.json(docs);
    });
});

app.post('/searchGenre',function(req,res){
    giantBombDatabase.find({'genres.name': req.body.genre}, function (err, docs) {
         res.json(docs);
    });
});

app.post('/searchConcept',function(req,res){
    giantBombDatabase.find({'concepts.name': req.body.concept}, function (err, docs) {
         res.json(docs);
    });
});

app.post('/searchDevelopers',function(req,res){
    giantBombDatabase.find({'developers.name': req.body.developer}, function (err, docs) {
         res.json(docs);
    });
});

app.post('/searchTheme',function(req,res){
    giantBombDatabase.find({'themes.name': req.body.theme}, function (err, docs) {
         res.json(docs);
    });
});

app.get('/makeHome',function(req,res){
    giantBombDatabase.find({},{'image.super_url': 1, 'image.icon_url': 1, 'id': 1, 'name': 1}, function (err, docs) {
        res.json(docs);
    });
});

app.get('/game/:id',function(req,res){
    giantBombDatabase.find({'id': parseInt(req.params.id)}, function (err, docs) {
         res.json(docs);
    });
});