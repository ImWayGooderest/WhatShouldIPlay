var dotenv = require('dotenv').config(),
    express = require("express"),
    request = require("request"),
    http = require("http"),
    bodyParser = require('body-parser'),
    app = express();

var mongojs = require('mongojs');

var db = mongojs('wsip');
var users = db.collection('users');
var userGames = db.collection('userGames');
var giantBombDatabase = db.collection('giantBombDatabase');
var sToGB = db.collection('sToGB');
// var steamKey, gbKey;

app.use(express.static(__dirname));
// Create our Express-powered HTTP server
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(3000, function() {
    console.log('App listening on port 3000!');
});

app.use(bodyParser());

// app.post('/API',function(req,res){ 
//     steamKey = process.env.STEAM_API_KEY;
//     gbKey = process.env.GB_API_KEY;
//     if(steamKey === null || gbKey === null) {
//         res.send("API keys failed to load!");
//     } else {
//         res.sendStatus(200);
//     }
//      
// });

app.post('/signup',function(req,res){ 
    users.save(req.body);
    res.sendStatus(200);
});

app.post('/exists',function(req,res){
    users.find(req.body, function(err, doc){
        if(doc != null){
            res.json(doc);
        }
    });
});

app.post('/signin',function(req,res){
    users.find(req.body, function(err, doc){
        if(doc != null){
            res.json(doc);
        }
    });
});

app.post('/update',function(req,res){
    var steamID = req.body.steamID;
    var url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key="+process.env.STEAM_API_KEY+"&steamid="+steamID+"&include_appinfo=1&format=json";
    request({url: url, json: true}, function (error, response, body) {
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
    console.log(url);
    request({url: url, json: true, headers: {'User-Agent': 'whatShouldIPlay'}}, function (error, response, body) {
        console.log(body.results[0].id);
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

//app.post('/gbAll',function(req,res){
//    var offset = 210;    
//    for(var x = 0; x < offset; x ++){
//       var url = "http://www.giantbomb.com/api/games/?format=json&api_key="+process.env.GB_API_KEY+"&filter=platforms:94&offset="+x;
//        request({url: url, json: true, headers: {'User-Agent': 'whatShouldIPlay'}}, function (error, response, body) {
//            if (!error && response.statusCode === 200) {
//                for(var i = 0; i < body.number_of_page_results; i ++){
//                    giantBombDatabase.update(body.results[i].name,body.results[i], {upsert: true});
//                    console.log("Offset: "+x+". Updating Game "+body.results[i].name);
//                }
//            }
//            else{
//                console.log("ERROR:"+error);
//            }
//        });
//    }
//
//});

app.post('/match',function(req,res){
    tempSteamID = req.body.steamAppID;
    sToGB.update({"steamAppID": req.body.steamAppID}, req.body, {upsert: true},function (err, docs) {
        var url = 'http://www.giantbomb.com/api/game/3030-'+req.body.giantBombID+'/?api_key='+process.env.GB_API_KEY+'&format=json'
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