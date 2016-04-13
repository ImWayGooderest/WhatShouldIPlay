var express = require("express"),
    request = require("request"),
    http = require("http"),
    bodyParser = require('body-parser'),
    app = express();

var $ = require("mongous").Mongous;

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
    $("wsip.users").save(req.body);
});

app.post('/exists',function(req,res){
    $("wsip.users").find(req.body, function(r){
        if(r.numberReturned == 0){
            res.json({
                "exists": "false"
            });
        }
        else{
            res.json({
                "exists": "true"
            });
        }
    });
});

app.post('/signin',function(req,res){
    $("wsip.users").find(req.body, function(r){
        console.log(r);
        if(r.numberReturned == 0){
            res.json({
                "exists": "false"
            });
        }
        else{
            res.json({
                "exists": "true"
            });
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

        $("wsip.userGames").save(tempSteam);
        //$("wsip.userGames").find({}, {"games.name": 1}, function(r){
        //    console.log();
        //});
    }
    else{
        console.log("ERROR:"+error);
    }
})

