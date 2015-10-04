var _ = require('lodash');
var path = require('path');
var r = require('rethinkdb');

// Keys / passport config
var secrets = require('../config/secrets');




exports.getProfile = function (req, res, next) {
    if (!req.params.username) {
        res.send({msg: 'Invalid Username Submitted', success: false});
    } else {
        r.db('pinnacle').table('users').filter({username: req.params.username}).run(req.app._rdbConn, function (err, cursor) {
            if (err) {
                return next(err);
            }
            cursor.toArray(function (err, result) {
                if (err) {
                    return next(err);
                }
                res.send(result[0]);
            });
        });
    }
};

exports.updateProfile = function (req, res, next) {
    if (!req.params.userid) {
        res.send({msg: 'Invalid user ID', success: false});
    } else {
        req.body.last_updated = Date.now();
        r.db('pinnacle').table('users').get(req.params.userid)
    .update(req.body).run(req.app._rdbConn, function (err, result) {
        if (err) {
            return next(err);
        }
        res.send({msg: 'User updated', success: true});
    });
    }
};

exports.login = function (req, res, next) {
    if (!req.body.username) {
        res.send({msg: 'Invalid Username Submitted', success: false});
    } else if (!req.body.password) {
        res.send({msg: 'Incorrect / No Password Entered', success: false});
    } else {
        r.db('pinnacle').table('auth').filter({username: req.body.username}).innerJoin(r.db('pinnacle').table('users').pluck('id', 'username'), function (authrow, userrow) { return authrow('username').eq(userrow('username'))}).zip().run(req.app._rdbConn, function (err, cursor) { 
            if (err) {
                return next(err);    
            }
            cursor.toArray(function (err, result) {
                if (err) {
                    return next(err);
                }
                
                if (result[0] && (req.body.password == result[0].password)) {
                    res.send({msg: 'Welcome back.' , success: true, userid: result[0].id});
                } else {
                    res.send({msg: 'Incorrect / No Password Entered', success: false});
                }
            })
        });
    }
};

exports.allUsers = function (req, res, next) {
    r.db('pinnacle').table('users').pluck("id", "name").run(req.app._rdbConn, function (err, cursor) {
        if (err) {
            return next(err);
        }
        cursor.toArray(function (err, result) {
            if (err) {
                return next(err);
            }
            res.send(result);
        });
    });
};
