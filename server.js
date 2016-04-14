var express = require("express"),
    request = require("request"),
    http = require("http"),
    bodyParser = require('body-parser'),
    app = express();

var mongojs = require('mongojs');

var db = mongojs('wsip');
var users = db.collection('users');
var userGames = db.collection('userGames');

app.use(express.static(__dirname));
// Create our Express-powered HTTP server
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(3000, function() {
    console.log('App listening on port 3000!');
});

app.use(bodyParser());

var steamKey = "91B7AEA8FECAFC8C2F96FC4A0E2BF0FA";
var steamID = "76561197962290933"
var url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
    +"?key="+steamKey+"&steamid="+steamID+"&include_appinfo=1&format=json"

app.post('/signup',function(req,res){ 
    users.save(req.body);
});

app.post('/exists',function(req,res){
    console.log(req.body);
    users.find(req.body, function(err, doc){
        if(doc != null){
            console.log("doc: "+JSON.stringify(doc));
            res.json(doc);
        }
    });
});

app.post('/signin',function(req,res){
    users.find(req.body, function(err, doc){
        if(doc != null){
            console.log("doc: "+JSON.stringify(doc));
            res.json(doc);
        }
    });

});

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        var tempSteam = body.response;
        tempSteam.steamID = steamID;

        userGames.save(tempSteam);
        //$("wsip.userGames").find({}, {"games.name": 1}, function(r){
        //    console.log();
        //});
    }
    else{
        console.log("ERROR:"+error);
    }
})

