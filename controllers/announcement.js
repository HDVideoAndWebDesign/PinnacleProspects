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
    res.send('update!');
};

// Post /announcements
exports.addNew = function(req, res, next) {
    if (!req.body.title || !req.body.announcement) {
        res.send({msg: 'invalid or missing announcement data', success: false});
    } else {
    
        var newAnnouncement = {
            text: req.body.announcement,
            title: req.body.title
        };

        r.db('pinnacle').table('announcements').insert(newAnnouncement).run(req.app._rdbConn, function (err, result) {
            if (err) {
                throw err;    
            }
            res.send({res: result, success: true});
        });
    }
};
