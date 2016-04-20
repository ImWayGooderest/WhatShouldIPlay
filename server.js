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
    var url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/" +"?key="+steamKey+"&steamid="+steamID+"&include_appinfo=1&format=json";
    request({url: url, json: true}, function (error, response, body) {
        if (error == null && response.statusCode === 200) {
            var tempSteam = body.response;
            tempSteam.steamID = steamID;
            userGames.update({"steamID": steamID},tempSteam, {upsert: true});
            res.json(tempSteam);
        }
        else{
            console.log("ERROR:"+error);
        }
    });
});

app.post('/gbAll',function(req,res){
    var offset = 210;    
    for(var x = 0; x < offset; x ++){
        var url = "http://www.giantbomb.com/api/games/?format=json&api_key="+gbKey+"&filter=platforms:94&offset="+x;
        request({url: url, json: true, headers: {'User-Agent': 'whatShouldIPlay'}}, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                for(var i = 0; i < body.number_of_page_results; i ++){
                    userGames.update(body.results[i].name,body.results[i], {upsert: true});
                    console.log("Offset: "+x+". Updating Game "+body.results[i].name);
                }
            }
            else{
                console.log("ERROR:"+error);
            }
        });
    }

});

app.post('/match',function(req,res){
    console.log("Matching: "+req.body.name);
    giantBombDatabase.find(req.body, function(err, doc){
        if(doc != null){
            res.json(doc);
        }
    });
});