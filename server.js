var express = require("express"),
    http = require("http"),
    bodyParser = require('body-parser'),
    redis = require("redis"),
    app = express();
// set up a static file directory to use for default routing
// also see the note below about Windows
app.use(express.static(__dirname));
// Create our Express-powered HTTP server
app.listen(3000, function() {
    console.log('App listening on port 3000!');
});

var tempWins = 0;
var templosses = 0;
var response = 0;

app.use(bodyParser());

redisClient = redis.createClient();

redisClient.get("wins", function(err, wins){
    if(err !== null){
        console.log("Error: "+err);
        return;
    }

    tempWins = parseInt(wins,10) || 0;
});

redisClient.get("losses", function(err, losses){
    if(err !== null){
        console.log("Error: "+err);
        return;
    }

    templosses = parseInt(losses,10)|| 0;
});

// set up our routes
app.post('/flip', function(req, res) {
    if (req.body.call === "heads") {
        response = 1;
    } else if (req.body.call === "tails") {
        response = 2;
    }

    var flip = randFlip(1, 2);

    if (response === flip) {
        res.json({
            "result": "win"
        });
        redisClient.incr("wins");
        tempWins = tempWins + 1;
    } else {
        res.json({
            "result": "lose"
        });
        redisClient.incr("losses");
        templosses = templosses + 1;
    }
});

app.get('/stats', function(req, res) {
    res.json({
        "wins": tempWins,
        "losses": templosses
    });

})

app.delete('/stats', function(req, res) {
    tempWins = 0;
    templosses = 0;
    redisClient.set("wins","0");
    redisClient.set("losses","0");
    res.json({
        "wins": tempWins,
        "losses": templosses
    });
})

//logic from https://blog.tompawlak.org/generate-random-values-nodejs-javascript
function randFlip(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}