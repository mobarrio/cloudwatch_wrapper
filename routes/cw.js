var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');

// Get AWS Credentials
// var credentials = new AWS.SharedIniFileCredentials({profile: process.env.CRED});
// AWS.config.credentials = credentials;

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Cloudwatch Wrapper', version: 'v1' });
});

router.get('/v1', function(req, res, next) {
  res.render('help', { title: 'Cloudwatch Wrapper', version: 'v1' });
});

// Secure api
router.use(function(req, res, next) {
   if (req.token) {
      jwt.verify(req.token, req.app.get('privateKey'), { algorithms: ['RS256'] }, function(err, decoded) {
        if (err) {
          return res.json({ msg: err });
        } else {
          next();
        }
      });
   } else {
      res.send({ msg: 'Token not found.' });
   }

});

router.post('/v1/env/:env/region/:Region/namespace/:Namespace', function (req, res) {
  var environment = req.params.env || 'pro';
  var credentials = new AWS.SharedIniFileCredentials({profile: environment});
  AWS.config.credentials = credentials;

  AWS.config.update({region: req.params.Region});
  var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });
  var params = {
          "Namespace": "AWS/"+req.params.Namespace,
          "Dimensions": []
  };

  cw.listMetrics(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      // res.send(data.Metrics);
      res.send(data);
    }
  });
});

router.post('/v1/env/:env/region/:Region/namespace/:Namespace/dname/:Name/dvalue/:Value', function (req, res) {
  var environment = req.params.env || 'pro';
  var credentials = new AWS.SharedIniFileCredentials({profile: environment});
  AWS.config.credentials = credentials;

  AWS.config.update({region: req.params.Region});
  var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });
  var params = {
          "Namespace": "AWS/"+req.params.Namespace,
          "Dimensions": [{
              "Name": req.params.Name,
              "Value": req.params.Value
           }]
  };

  cw.listMetrics(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      // res.send(data.Metrics);
      res.send(data);
    }
  });

});

router.post('/v1/env/:env/region/:Region/namespace/:Namespace/metricname/:MetricName/dname/:Name/dvalue/:Value', function (req, res) {
  var environment = req.params.env || 'pro';
  var credentials = new AWS.SharedIniFileCredentials({profile: environment});
  AWS.config.credentials = credentials;

  AWS.config.update({region: req.params.Region});
  var durationInMinutes = 60;
  var period = durationInMinutes * 60;
  var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });
  var EndTime = new Date;
  var StartTime = new Date(EndTime - 15*60*1000);
  var params = {
      "EndTime": EndTime,
      "StartTime": StartTime,
      "Period": period,
      "Namespace": "AWS/"+req.params.Namespace,
      "MetricName": req.params.MetricName,
      "Dimensions": [
          {
              "Name": req.params.Name,
              "Value": req.params.Value
          }
      ], 
      "Statistics": ['Average','Sum'], //['SampleCount', 'Average', 'Sum', 'Minimum', 'Maximum'],
  };

  //console.log(params)
  cw.getMetricStatistics(params, function (err, data) {
      if (err) {
          console.log("Error", err);
      } else {
          // console.log(JSON.stringify(data.Metrics));
          res.send(data.Datapoints[0]);
      }
  });

});

router.get('/v1/env/:env/health', function(req, res) { 
  var environment = req.params.env || 'pro';
  res.json({ status: 'UP', env: environment }); 
});

module.exports = router;
