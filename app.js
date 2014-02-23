var MongoClient = require('mongodb').MongoClient;

var express = require('express');
var app = express();

var nodestatic = require('node-static');
var file = new nodestatic.Server('./public', { cache: false });
app.use(express.static(__dirname + '/public'));

MongoClient.connect('mongodb://127.0.0.1:27017/supergame', function (err, db) {
    if (err) throw err;

    app.get('/', function (req, res) {
        file.serve(req, res);
    });

    app.get('/get', function (req, res) {
        db.collection('main').find().toArray(function (err, results) {
            if (err) {
                console.warn(err.message);
                res.send({success: false});
                return;
            }
            res.send({success: true, count: results[0].count, visits: results[0].visits});
        });
    });

    app.get('/getComments', function (req, res) {
        db.collection('comments').find().sort({date: -1}).toArray(function (err, results) {
            if (err) {
                console.warn(err.message);
                res.send({success: false});
                return;
            }
            res.send({success: true, comments: results});
        });
    });

    app.get('/set', function (req, res) {
        db.collection('main').update({}, {$inc: {count: +1}}, {}, function (err) {
            if (err) {
                console.warn(err.message);
                res.send({success: false});
                return;
            }
            res.json({success: true});
        });
    });

    app.get('/comment', function (req, res) {
        if (!req.query.name || !req.query.text) {
            res.json({success: false});
            return;
        }
        db.collection('comments').insert({
            name: req.query.name,
            text: req.query.text,
            date: new Date()
        }, function (err) {
            if (err) {
                console.warn(err.message);
                res.send({success: false});
                return;
            }
            res.json({success: true});
        });
    });

    app.listen(80);
});