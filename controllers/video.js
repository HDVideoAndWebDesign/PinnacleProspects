var _ = require('lodash');
var path = require('path');
var r = require('rethinkdb');

// Keys / passport config
var secrets = require('../config/secrets');



exports.uploadVideo = function (req, res, next) {
    if (!req.body.userid || !req.body.video_link ) {
        res.send({msg: 'Invalid or missing data.', success: false });
    } else {
        var newVid = {
            admin_viewed: false,
    created_date: Date.now(),
    userid: req.body.userid,
    note: req.body.note || "",
    title: req.body.title || "",
    video_link: req.body.video_link
        };
        r.db('pinnacle').table('videos').insert(newVid).run(req.app._rdbConn, function (err, result) {
            if (err) {
                throw err;
            }
            res.send({res: result, success: true});
        });
    }
};

exports.getVideos = function (req, res, next) {
    if (!req.params.userid) {
        res.send({msg: 'Invalid or missing userid', success: false});
    } else {

        r.db('pinnacle').table('videos').filter({userid: req.params.userid}).run(req.app._rdbConn, function (err, cursor) {
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
