const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const bearerToken = require('express-bearer-token');
const figlet  = require('figlet');
const auth = require('basic-auth');
const conf = require('./config/config');
const pkgname = process.env.npm_package_name;
const pkgversion = process.env.npm_package_version;
const debug = false; // Set true para ver debug por consola.

global.logts = function(msg){
   let ts = moment(new Date()).format('DD/MM/YYYY HH:mm:ss.SSS - ')
   debug && console.log(ts,msg)
 };

console.log(figlet.textSync('  '+pkgname+' v '+pkgversion));
console.log("------------------------------------------------------------------------------------------------");
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
app.use(function(req, res, next) {
   logts('Middleware de autenticaicon Basic');
   if(req.token) {
      logts('Bearer token definodo. Procede con Autenticacion JWT.');
      next();
   }else{
      logts('Bearer token no definodo. Procede con Autenticacion Basic.');
      var credentials = auth(req);
      if (credentials === undefined ) { 
         if(credentials != undefined && (credentials.name === "admin" && credentials.pass === "zabbix")) {
            logts('Usuario autenticado.');
            next();
         }else{
            logts('Usuario no autenticado.');
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Cloudwatch Wrapper"');
            res.end('Unauthorized.');
         } 
      } else {
         logts('Usuario autenticado credenciales disponibles.');
         const authstr = credentials.name + ':' + credentials.pass;
         req.headers.authorization = 'Basic ' + new Buffer.alloc(authstr.length,authstr).toString('base64');
         next();
      }
   }
});

app.use(function(req, res, next) {
   logts('Middleware de autenticaicon Bearer');
   if (conf.auth.exclude.includes(req.url.valueOf())) {
      logts('Endpoint excluido de autenticacion.');
      return next();
   }else{
      logts('Verificacion del Bearer token.');
      if (req.token) {
         jwt.verify(req.token, req.app.get('privateKey'), { algorithms: ['RS256'] }, function(err, decoded) {
         if (err) {
            return res.json({ msg: err });
         } else {
         logts('Bearer token verificado.');
         next();
         }
         });
      } else {
         logts('Bearer token no encontrado.');
         res.send({ msg: 'Bearer token not found.' });
      }
   }
});

// Routes
app.use('/',       indexRouter);
app.use('/api',    cwRouter);
app.use('/auth',   authRouter);
app.use('/health', healthRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
   res.status(400);
   res.render('404.pug', {title: '404: File Not Found'});

});

// error handler
app.use(function(err, req, res, next) {
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};

   // render the error page
   res.status(err.status || 500);
   res.render('error');
});

module.exports = app;
