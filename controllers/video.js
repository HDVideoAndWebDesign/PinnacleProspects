var _ = require('lodash');
var path = require('path');
var r = require('rethinkdb');

// Keys / passport config
var secrets = require('../config/secrets');

// POST /videos
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
                return next(err);
            }
            res.send({res: result, success: true});
        });
    }
};

// POST /replies
exports.uploadReply = function (req, res, next) {
    if (!req.body.userid || !req.body.video_link  || !req.body.videoid) {
        res.send({msg: 'Invalid or missing data.', success: false });
    } else {
        var newReply = {
            player_viewed: false,
            created_date: Date.now(),
            userid: req.body.userid,
            note: req.body.note || "",
            title: req.body.title || "",
            video_link: req.body.video_link,
            video_id: req.body.videoid
        };
        r.db('pinnacle').table('video_replies').insert(newReply).run(req.app._rdbConn, function (err, result) {
            if (err) {
                return next(err);
            }
            res.send({res: result, success: true});
        });
    }
};

// GET /videos/:userid
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
                    return next(err);
                }

                res.send(result);
            });
        });
    }
};

// GET /video/:videoid
exports.getVideo = function (req, res, next) {
    if (!req.params.videoid) {
        res.send({msg: 'Invalid or missing videoid', success: false});
    } else {

        r.db('pinnacle').table('videos').filter({id: req.params.videoid}).run(req.app._rdbConn, function (err, cursor) {
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
    }
};

// PUT /videos
exports.videoViewed = function (req, res, next) {
    if (!req.body.videoid) {
        res.send({msg: 'Invalid or missing video ID', success: false});
    } else {
        r.db('pinnacle').table('videos').get(req.body.videoid)
    .update({admin_viewed: true, date_seen: Date.now()}).run(req.app._rdbConn, function (err, result) {
        if (err) {
            return next(err);
        }
        res.send({msg: 'Video marked as viewed', success: true});
        });
    }
}

// PUT /replies
exports.replyViewed = function (req, res, next) {
    if (!req.body.videoid) {
        res.send({msg: 'Invalid or missing video ID', success: false});
    } else {
        r.db('pinnacle').table('video_replies').get(req.body.videoid)
    .update({player_viewed: true, date_seen: Date.now()}).run(req.app._rdbConn, function (err, result) {
        if (err) {
            return next(err);
        }
        res.send({msg: 'Video reply marked as viewed', success: true});
        });
    }
}
