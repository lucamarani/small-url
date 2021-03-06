var mongo = require('mongodb').MongoClient;
var max = parseInt('zzz', 36)

var database = {
    
    uri: process.env.MONGOURI,
    
    connection: null,
    
    urls: null,
    
    connect: function(callback) {
        mongo.connect(this.uri, function(err, db) {
            if (err) throw err;
            database.connection = db;
            callback();
        })
    },
    
    log: function() {
        console.log(this.connection);
    },
    
    init: function() {
        this.connection.createCollection('urls', {safe:true}, function(err, collection) {
            if (err) return;
        });
        database.urls = this.connection.collection('urls');
        database.urls.count(function(err, count) {
            if(!err && count === 0) {
                var documents = [];
                for(var i = 0; i <= max; i++) {
                    documents.push({
                        url: null,
                        code: i,
                        used: false
                    });
                }
                database.urls.createIndex({used: 1});
                database.urls.createIndex({code: 1}, {unique: true});
                database.urls.insert(documents);
            }
        });
    },
    
    set: function(url, callback) {
        var query = { state: 'OK'};
        database.urls.count({used: false}).then(function(n) {
            var r =Math.floor(Math.random() * (n + 1));
                database.urls.find({used: false}).limit(1).skip(r).next().then(function(e) {
                    database.urls.update({code: r}, {
                        $set: {
                            url: url,
                            used: true
                        }
                    });
                    callback({ original_url: url, short_url: 'https://small-url.herokuapp.com/' + r.toString(36) });
                });
        });
    },
    
    get: function(code, callback) {
        database.urls.findOne({code: parseInt(code, 36)}, {url: 1}).then(function(e) {callback(e.url);});
    }
    
}

module.exports = database;