var express = require('express');
var fs = require('fs');
var router = express.Router();
const logger = require('../config/logger');

router.get('/', function(req, res, next) {
  res.redirect('/auth');
  logger.debug("Index - Redirect /auth");
});

router.get('/about', function (req, res) {
  fs.readFile('LICENSE', 'utf8', function(err, contents) {
    res.send('<pre>'+contents+'</pre>');
    logger.debug("Index - About: %o",contents);
  });
})

module.exports = router;
