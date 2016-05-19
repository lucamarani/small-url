var express = require('express');
var database = require('./dblogic.js');
var re_weburl = require('./regex-weburl.js')

var path = process.cwd();
var app = express();
var code_check = /^(([a-z]|\d){1,3})$/;

database.connect(function() {
    database.init();
})

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
    res.sendFile(path + '/public/index.html');
    
});

app.get('/set/*', function(req, res) {
    if(req.params[0].match(re_weburl) !== null) {
        database.set(req.params[0], function(e) {
            res.json(e);
        });
    } else {
        res.json({error: 'Wrong url format, make sure you have a valid protocol and real site.'});
    }
});

app.get('/*', function(req, res) {
    console.log(req.params[0])
    console.log(req.params[0].match(code_check));
    if(req.params[0].match(code_check) !== null) {
        console.log(req.params[0].match(code_check));
        database.get(req.params[0], function(e) {
            if(e !== null) {
                res.redirect(301, e)
            } else {
                res.json({error: 'There is no corresponding URL in the database.'});
            }
        });
    } else {
        res.json({error: 'The code is invalid.'});
    }
})

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});