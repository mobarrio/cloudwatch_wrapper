var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Cloudwatch Wrapper', version: 'v1' });

  /*
  var remoteAddr = req.connection.remoteAddress;
  var remotePort = req.connection.remotePort;
  var localAddr  = req.connection.localAddress;
  var localPort  = req.connection.localPort;
  res.send('localAddress:' + localAddr + ':' + localPort + '--- '+ remoteAddr + ' --- ' );
  */

});

router.get('/about', function (req, res) {
  res.send('About this API');
})

module.exports = router;
