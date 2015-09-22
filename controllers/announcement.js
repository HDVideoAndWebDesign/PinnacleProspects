var _ = require('lodash');
var path = require('path');
var r = require('rethinkdb');

// Keys / passport config
var secrets = require('../config/secrets');



// Get /announcements
exports.getAll = function(req, res, next) {
    r.db('pinnacle').table('announcements').run(req.app._rdbConn, function (err, cursor) {
        if (err) {
            return next(err);
        }
        cursor.toArray(function (err, result) {
           if (err) {
               throw err;    
           }
           res.send(result); 
        });
    });
};

// Put /announcements
exports.readByUser = function(req, res, next) {
    res.send('weeee');
};

// Post /announcements
exports.addNew = function(req, res, next) {
    res.send('neeeeeew');
};
