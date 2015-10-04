var _ = require('lodash');
var path = require('path');
var r = require('rethinkdb');

// Keys / passport config
var secrets = require('../config/secrets');

// Get /exercise/:exerciseid
exports.getByExerciseId = function (req, res, next) {
    if (!req.params.exerciseid) {
        res.send({msg: 'Invalid exercise ID', success: false});
    } else {
        r.db('pinnacle').table('exercises').get(req.params.exerciseid).run(req.app._rdbConn,function (err, result) {
            if (err) {
                throw err;
            }
            res.send(result);
        });
    }
};

// Get /exercises
exports.getAll = function (req, res, next) {
    if (!req.body.userid) {
        res.send({msg: 'Shouldnt you be logged in?', success: false});
    } else {
        r.db('pinnacle').table('exercises')
            .run(req.app._rdbConn, function (err, cursor) {
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
    }
};

// Post /exercise
exports.addNew = function (req, res, next) {
    if (!req.body.exercise_name || !req.body.description) {
        res.send({msg: 'Exercise request missing a required field!', success: false});
    } else {
        var newExercise = {
            created_date: Date.now(),
            description: req.body.exercise_description,
            exercise_name: req.body.exercise_name,
            video_url: req.body.video_url,
            deleted: false
        }
        r.db('pinnacle').table('exercises').insert(newExercise).run(req.app._rdbConn, function (err, result) {
            if (err) {
                throw err;
            }
            res.send({res: result, success: true});
        });
    }
};

// Delete /exercise
exports.remove = function (req, res, next) {
    if (!req.body.exerciseid) {
        res.send({msg: 'Request missing required data!'});
    } else {
        r.db('pinnacle').table('exercises').get(req.body.exerciseid).update({deleted: true}).run(req.app._rdbConn, function (err, result) {
            if (err) {
                throw err;
            }
            res.send({res: result, success: true});
        });
    }
};
