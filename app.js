var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var bearerToken = require('express-bearer-token');

var indexRouter  = require('./routes/index');
var cwRouter     = require('./routes/cw');
var authRouter   = require('./routes/authentication');
var healthRouter = require('./routes/health');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('privateKey', fs.readFileSync('config/jwtRS256.key'));
app.set('logedIn',0);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bearerToken());

app.use('/',     indexRouter);
app.use('/api',  cwRouter);
app.use('/auth', authRouter);
app.use('/health', healthRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
   res.status(400);
   res.render('404.pug', {title: '404: File Not Found'});

});

// error handler
app.use(function(err, req, res, next) {
   //req.setTimeout(5000);
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};

   // render the error page
   res.status(err.status || 500);
   res.render('error');
});

module.exports = app;
