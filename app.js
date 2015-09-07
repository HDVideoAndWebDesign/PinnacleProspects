/**
 * Module dependencies.
 */
var express = require('express');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');

var _ = require('lodash');
var flash = require('express-flash');
var path = require('path');
var passport = require('passport');
var expressValidator = require('express-validator');
var assets = require('connect-assets');
var r = require('rethinkdb');

/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');


/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to Rethink
 **/
app._rdbConn = null;
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    app._rdbConn = conn;
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public/favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


/**
 * Primary app routes.
 */
app.get('/', function (req, res, next) {
    res.send('hello');
});

//app.get('/profile');

app.get('/profile/:username', function (req, res, next) {
    if (!req.params.username) {
        res.send({msg: 'Invalid Username Submitted', success: false});
    } else {
        r.db('pinnacle').table('users').filter({username: req.params.username}).run(req.app._rdbConn, function (err, cursor) {
            if (err) {
                return next(err);
            }
            cursor.toArray(function (err, result) {
                if (err) {
                    throw err;
                }
                res.send(result[0]);
            });
        });
    }
});

app.put('/profile/:userid', function (req, res, next) {
    if (!req.params.userid) {
         res.send({msg: 'Invalid user ID', success: false});
    } else {
        req.body.last_updated = Date.now();
        r.db('pinnacle').table('users').get(req.params.userid)
        .update(req.body).run(req.app._rdbConn, function (err, result) {
            if (err) {
                throw err;
            }
            res.send({msg: 'User updated', success: true});
        });
    }
});

app.post('/login', function (req, res, next) {
    if (!req.body.username) {
        res.send({msg: 'Invalid Username Submitted', success: false});
    } else if (!req.body.password) {
        res.send({msg: 'Incorrect / No Password Entered', success: false});
    } else {
        r.db('pinnacle').table('auth').filter({username: req.body.username}).run(req.app._rdbConn, function (err, cursor) {
            if(err) {
                return next(err);
            }
            cursor.toArray(function (err, result) {
                if (err) {
                    throw err;
                }

                if (req.body.password == result[0].password) {
                    res.send({msg: 'Welcome back.' , success: true});
                } else {
                    res.send({msg: 'Incorrect / No Password Entered', success: false});
                }

            });
        });
    }
});

// send video to s3
app.post('/videos/:userid', function (req, res, next) {
    res.send({video_url: 'http://www.thespicegirls.com/'});
});

app.get('/videos/:userid', function (req, res, next) {
    res.send('videos by user');
});

app.get('/videoauth', function (req, res, next) {
    res.send(secrets.s3);
});

// all messages for recipient ordered by created_date desc limit (10?)
app.get('/messages/:userid', function (req, res, next) {
    if (!req.params.userid) {
        res.send({msg: 'Invalid UserID Submitted', success: false});
    } else {
        r.db('pinnacle').table('messages').filter({recipient: req.params.userid})
        .outerJoin(r.db('pinnacle').table('users'), function (message, user) {
            return message('sender').eq(user('id'))}).map(
                {
                    note: r.row('left')('note'),
                    sender: r.row('right')('name'),
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
});

app.put('/message/seen/:messageid', function (req, res, next) {
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
});

app.put('/message/unseen/:messageid', function (req, res, next) {
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
});

app.post('/message', function (req, res, next) {
  res.send('create a message');
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
module.exports = app;
