// dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');

//------------------------------------------------------
var facebookpassport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy;
 
var FB = require('fb');
var https = require('https');
var facebookapi = require('./facebookapi');
facebookapi.postMessage();

facebookpassport.serializeUser(function(user, done) {
    done(null, user);
});
facebookpassport.deserializeUser(function(user, done) {
    done(null, user);
});
facebookpassport.use(new FacebookStrategy({
        clientID: '971166696248201',
        clientSecret: '871f948fac1bcde691d602cf1ce3aaf6',
        callbackURL: "https://yakufit.com/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
		FB.setAccessToken(accessToken);
		//console.log(accessToken);
		var body = 'user data';
		FB.api('me/feed', 'post', { message: body}, function (res) {
			if(!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				return;
			}
			console.log('Post Id: ' + res.id);
		});
		// console.log(accessToken);
        done(null,profile);
    }
));
//------------------------------------------------------

var app = express();

// test
// view engine setup 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(facebookpassport.initialize());
app.use(facebookpassport.session());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect('mongodb://localhost/yakufit_mongoose');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
