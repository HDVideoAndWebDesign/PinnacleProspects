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
 * Controllers for routing
 */
var user = require('./controllers/user');
var video = require('./controllers/video');
var message = require('./controllers/message');
var announcement = require('./controllers/announcement');

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


// Main app route 
// primarily a dummy as public/index.html 
// should be served instead of this response
app.get('/', function (req, res, next) {
    res.send('pinnacle prospects');
});

// User routes
app.get('/profile/:username', user.getProfile);
app.put('/profile/:userid', user.updateProfile);
app.post('/login', user.login);
app.get('/users/all', user.allUsers);

// Video routes
app.post('/videos', video.uploadVideo); 
app.get('/videos/:userid', video.getVideos);
app.get('/video/:videoid', video.getVideo);

app.get('/videoauth', function (req, res, next) {
    res.send(secrets.s3);
});

// Message routes 
app.get('/messages/:userid', message.getForUser);
app.delete('/messages', message.remove);
app.put('/message/seen/:messageid', message.markAsRead);
app.put('/message/unseen/:messageid', message.markAsUnread);
app.post('/message', message.addNew);

// Anouncment routes
app.get('/announcements', announcement.getAll);
app.put('/announcements', announcement.readByUser);
app.post('/announcements', announcement.addNew);

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
