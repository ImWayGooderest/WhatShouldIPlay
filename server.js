var express = require("express"),
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
var steamKey, gbKey;

app.use(express.static(__dirname));
// Create our Express-powered HTTP server
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(3000, function() {
    console.log('App listening on port 3000!');
});

app.use(bodyParser());

app.post('/API',function(req,res){ 
    steamKey = req.body.steamAPI;
    gbKey = req.body.giantBombAPI;
});

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
    var url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key="+steamKey+"&steamid="+steamID+"&include_appinfo=1&format=json";
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
                console.log(i +" "+docs+" "+tempSteam.games[i].appid+" "+docs[0].giantBombID);
                console.log("Found ID, Adding")
                tempSteam.games[i].giantBombID = docs[0].giantBombID.toString();
                console.log(tempSteam.games[i]);
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
                    userGames.find({"steamID": tempSteam.steamID}, function (err, docs) {
                            res.json(docs);
                    });
                });
            }            
        });
    })();
}

app.post('/gbAll',function(req,res){
    var offset = 210;    
    for(var x = 0; x < offset; x ++){
        var url = "http://www.giantbomb.com/api/games/?format=json&api_key="+gbKey+"&filter=platforms:94&offset="+x;
        request({url: url, json: true, headers: {'User-Agent': 'whatShouldIPlay'}}, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                for(var i = 0; i < body.number_of_page_results; i ++){
                    giantBombDatabase.update(body.results[i].name,body.results[i], {upsert: true});
                    console.log("Offset: "+x+". Updating Game "+body.results[i].name);
                }
            }
            else{
                console.log("ERROR:"+error);
            }
        });
    }

});

app.post('/match/',function(req,res){
    sToGB.update({"steamAppID": req.body.steamAppID}, req.body, {upsert: true},function (err, docs) {
    });
    res.sendStatus(200);
});