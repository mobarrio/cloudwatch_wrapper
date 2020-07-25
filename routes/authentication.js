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
   const credentials = auth(req);
   const ttl = '1h';
   var account = ((typeof req.params.account === 'undefined') ? ((typeof req.body.Config === 'undefined' || typeof req.body.Config.Account === 'undefined' || req.body.Config.Account === "") ? 'pro' : req.body.Config.Account) : req.params.account);
   if(credentials != undefined && (credentials.name === "admin" && credentials.pass === "zabbix")) {
      const payload = { check:  true };
      const token = jwt.sign(payload, req.app.get('privateKey'), { expiresIn: ttl, algorithm: 'RS256' });
      res.json({ account: account, token: token, ttl: ttl });

   } else {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Cloudwatch Wrapper"');
      res.end('Unauthorized TTL');
   }
 }catch(error){
      res.send({ msg: 'Auth TTL error.' });
 }
};

function TTLForeverHandler(req, res, next) {
   try {
     var credentials = auth(req);
     var ttl = req.params.ttl || '100y';
     var account = ((typeof req.params.account === 'undefined') ? ((typeof req.body.Config === 'undefined' || typeof req.body.Config.Account === 'undefined' || req.body.Config.Account === "") ? 'pro' : req.body.Config.Account) : req.params.account);
 
     if(credentials != undefined && (credentials.name === "admin" && credentials.pass === "zabbix")) {
        const payload = { check:  true };
        const token = jwt.sign(payload, req.app.get('privateKey'), { expiresIn: ttl, algorithm: 'RS256' });
        res.json({ account: account, token: token, ttl: ttl });
  
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
   res.render('helptoken', { title: 'Cloudwatch Wrapper', version: 'v1' });
};

router.get('/', LoginHandler);
router.post('/verify', VerifyHandler);
router.post('/get/credentials', TTLHandler);
router.post('/get/credentials/:account', TTLHandler);
router.post('/get/credentials/:account/ttl', TTLForeverHandler);
router.post('/get/credentials/:account/ttl/:ttl', TTLForeverHandler);

module.exports = router;
