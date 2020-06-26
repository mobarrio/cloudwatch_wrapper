var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var moment = require('moment');
var auth = require('basic-auth');

function VerifyHandler(req, res, next) {
 try {
   if (req.token) {
      jwt.verify(req.token, req.app.get('privateKey'), { algorithms: ['RS256'] }, function(err, decoded) {
        if (err) {
          return res.json({ msg: err });    
        } else {
          req.decoded = decoded;
          var msg = {};
          msg.check = decoded.check;
          msg.iat = moment(new Date(decoded.iat * 1000)).format('DD/MM/YYYY HH:mm:ss');
          msg.exp = moment(new Date(decoded.exp * 1000)).format('DD/MM/YYYY HH:mm:ss');
          return res.json({ msg: msg });    
        }
      });
   } else {
      res.send({ msg: 'Token not found.' });
   }
 }catch(error){
      res.send({ msg: 'Verify error.' });
 }
};

function TTLHandler(req, res, next) {
 try {
   var credentials = auth(req);
   var ttl = req.params.ttl || '1h';

   if(credentials != undefined && (credentials.name === "admin" && credentials.pass === "zabbix")) {
      const payload = { check:  true };
      const token = jwt.sign(payload, req.app.get('privateKey'), { expiresIn: ttl, algorithm: 'RS256' });
      res.json({ msg: 'Authentication ok', token: token });

   } else {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Cloudwatch Wrapper"');
      res.end('Unauthorized TTL');
   }
 }catch(error){
      res.send({ msg: 'Auth TTL error.' });
 }
};

function LoginHandler(req, res, next) {
   var credentials = auth(req);

   if(credentials != undefined && (credentials.name === "admin" && credentials.pass === "zabbix")) {
      res.render('helptoken', { title: 'Cloudwatch Wrapper', version: 'v1' });
   } else {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Cloudwatch Wrapper"');
      res.end('Unauthorized Login.');
   }
};

// Unsecure Methods
router.post('/verify', VerifyHandler);

// Secure Methods
router.use(function(req, res, next) {
   var credentials = auth(req);

   if (credentials === undefined ) { 
       if(credentials != undefined && (credentials.name === "admin" && credentials.pass === "zabbix")) {
          next();
       }else{
          res.statusCode = 401;
          res.setHeader('WWW-Authenticate', 'Basic realm="Cloudwatch Wrapper"');
          res.end('Unauthorized.');
       } 
   } else {
       const authstr = credentials.name + ':' + credentials.pass;
       req.headers.authorization = 'Basic ' + new Buffer.alloc(authstr.length,authstr).toString('base64');
       next();
   }
});

router.get('/', LoginHandler);
// router.get('/ttl', TTLHandler);
// router.get('/ttl/:ttl', TTLHandler);
router.post('/ttl', TTLHandler);
router.post('/ttl/:ttl', TTLHandler);

module.exports = router;
