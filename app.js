require('./env');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const momenttz = require('moment-timezone');
const bearerToken = require('express-bearer-token');
const figlet  = require('figlet');
const auth = require('basic-auth');
const conf = require('./config/config');
const pkgname = process.env.npm_package_name || "CloudWatch";
const pkgversion = require('./package.json').version;
const logger = require('./config/logger');
const morgan = require('morgan');
morgan.token('date', function(req, res, tz) { return momenttz().tz(tz).format('YYYY-MM-DD HH:mm:ss.SSS -'); });
morgan.format('cwformat', ':date[Europe/Madrid] [debug] :method :url (:response-time ms)');

Array.prototype.findReg = function(match) {
   var reg = new RegExp(match);

   return this.filter(function(item){
       return typeof item == 'string' && item.match(reg);
   });
}

console.log(figlet.textSync('  '+pkgname+' - '+pkgversion));
console.log("------------------------------------------------------------------------------------------------");
logger.debug('APP - Debug is ON');

// Definicion de los diferentes routers
var indexRouter  = require('./routes/index');
var cwRouter     = require('./routes/cw');
var authRouter   = require('./routes/authentication');
var healthRouter = require('./routes/health');
var HHRouter     = require('./routes/help');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('privateKey', fs.readFileSync('config/jwtRS256.key'));
app.set('logedIn',0);

if (process.env.LOG_LEVEL === 'debug') {
    app.use(morgan('cwformat'));
    // app.use(morgan('dev'));
  }
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bearerToken());
app.use(function(req, res, next) {
   logger.debug('APP - Middleware de autenticaicon Basic');
   if(req.token) {
      logger.debug('APP - Bearer token definodo. Procede con Autenticacion JWT.');
      next();
   }else{
      logger.debug('APP - Bearer token no definodo. Procede con Autenticacion Basic.');
      var credentials = auth(req);
      if (credentials === undefined ) { 
         if(credentials != undefined && (credentials.name === "admin" && credentials.pass === "zabbix")) {
            logger.debug('APP - Usuario autenticado.');
            next();
         }else{
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Cloudwatch Wrapper"');
            res.end('Unauthorized.');
            logger.debug('APP - Usuario no autenticado.');
         } 
      } else {
         logger.debug('APP - Usuario autenticado credenciales disponibles.');
         const authstr = credentials.name + ':' + credentials.pass;
         req.headers.authorization = 'Basic ' + new Buffer.alloc(authstr.length,authstr).toString('base64');
         next();
      }
   }
});

app.use(function(req, res, next) {
   logger.debug('APP - Middleware de autenticaicon Bearer');
   logger.debug('APP -  %o',req.url.valueOf());
   if (conf.auth.exclude.findReg(req.url.valueOf())) {
      logger.debug('APP - Endpoint excluido de autenticacion.');
      return next();
   }else{
      logger.debug('APP - Verificacion del Bearer token.');
      if (req.token) {
         jwt.verify(req.token, req.app.get('privateKey'), { algorithms: ['RS256'] }, function(err, decoded) {
         if (err) {
            logger.debug('APP - Error: %o',err);
            return res.json({ msg: err });
         } else {
            logger.debug('APP - Bearer token verificado.');
         next();
         }
         });
      } else {
         logger.debug('APP - Bearer token no encontrado.');
         res.send({ msg: 'Bearer token not found.' });
      }
   }
});

// Routes
app.use('/',              indexRouter);
app.use('/api',           HHRouter);
app.use('/api/v1',        HHRouter);
app.use('/api/v1/aws',    cwRouter);
app.use('/auth',          authRouter);
app.use('/health',        healthRouter);

/*
app.use('/',              indexRouter);
app.use('/api',           cwRouter);
app.use('/auth',          authRouter);
app.use('/health',        healthRouter);
*/


//router.all('*', (req, res) => res.status(405).json({ errorCode: '405', errorDescription: req.method + ' is Method Not Allowed.' }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
   res.status(400);
   res.render('404.pug', {title: '404: File Not Found'});
   logger.debug('APP - Render %o',{title: '404: File Not Found'});
});

// error handler
app.use(function(err, req, res, next) {
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};

   // render the error page
   res.status(err.status || 500);
   res.render('error');
   logger.debug('APP - Render Error 500');
});

module.exports = app;
