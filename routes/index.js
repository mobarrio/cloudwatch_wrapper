var express = require('express');
var fs = require('fs');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.redirect('/auth');
});

router.get('/about', function (req, res) {
  fs.readFile('LICENSE', 'utf8', function(err, contents) {
    res.send('<pre>'+contents+'</pre>');
  });
})

module.exports = router;
