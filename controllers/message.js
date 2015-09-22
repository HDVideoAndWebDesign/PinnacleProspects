var _ = require('lodash');
var path = require('path');
var r = require('rethinkdb');

// Keys / passport config
var secrets = require('../config/secrets');

// Get /messages/:userid
exports.getForUser = function (req, res, next) {
    if (!req.params.userid) {
        res.send({msg: 'Invalid UserID Submitted', success: false});
    } else {
        r.db('pinnacle').table('messages').filter({recipient: req.params.userid})
    .outerJoin(r.db('pinnacle').table('users'), function (message, user) {
        return message('sender').eq(user('id'))}).map(
        {
            note: r.row('left')('note'),
               sender: r.row('right')('name'),
               profile_image: r.row('right')('image'),
               created_date: r.row('left')('created_date'),
               id: r.row('left')('id'),
               date_seen: r.row('left')('date_seen')
        })
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

// Put /message/seen/:messageid
exports.markAsRead = function (req, res, next) {
    if (!req.params.messageid) {
        res.send({msg: 'Invalid message ID', success: false});
    } else {
        r.db('pinnacle').table('messages').get(req.params.messageid)
    .update({date_seen: r.now()}).run(req.app._rdbConn, function (err, result) {
        if (err) {
            throw err;
        }
        res.send({msg: 'Message marked as read', success: true});
    });
    }
};

// Put /message/unseen/:messageid
exports.markAsUnread = function (req, res, next) {
    if (!req.params.messageid) {
        res.send({msg: 'Invalid message ID', success: false});
    } else {
        r.db('pinnacle').table('messages').get(req.params.messageid)
    .update({date_seen: 0}).run(req.app._rdbConn, function (err, result) {
        if (err) {
            throw err;
        }
        res.send({msg: 'Message marked as unread', success: true});
    });
    }
};

// Post /message
exports.addNew = function (req, res, next) {
    if (!req.body.note || !req.body.recipientid || !req.body.sender) {
        res.send({msg: 'Message request missing a required field!', success: false});
    } else {
        var newMsg = {
            date_seen: 0,
            created_date: Date.now(),
            recipient: req.body.recipientid,
            sender: req.body.sender,
            profile_image: req.body.profile_image,
            note: req.body.note
        }
        r.db('pinnacle').table('messages').insert(newMsg).run(req.app._rdbConn, function (err, result) {
            if (err) {
                throw err;
            }
            res.send({res: result, success: true});
        })
    }
};

// Delete /message

exports.remove = function (req, res, next) {
  res.send({msg: 'will remove ' + req.body.messageid + 'when i get around to it'});
};
