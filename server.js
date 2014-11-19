var mongoose = require('mongoose');
var express  = require('express');
var flash = require('express-flash');
var passport = require('passport');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/test');
mongoose.connection.on('error', console.error);
require('./app/passport')(passport);
var app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'simpleauthorizationtestapp', resave: true, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'app', 'views'));
app.use(express.static(path.join(__dirname, 'public')));
require('./app/routes')(app, passport);
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', { title: 'Error', error: err, user: req.user });
});
app.listen(80);