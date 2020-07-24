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

router.get('/v1/aws/listmetrics', function (req, res) {
  const account = req.body.Config.Account || 'pro';
  const region = req.body.Config.Region;
  const metric = req.body.Metric;

  try {
    var credentials = new AWS.SharedIniFileCredentials({profile: account});
    AWS.config.update({
      region: region,
      credentials: credentials,
      httpOptions: {
        connectTimeout: 1000, // Syn Timeout
        timeout: 3000 // Inactivity timeout
      }
    });
    var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });
  } catch (error) {
    res.status(401).json({status: "error", msg: "Error retrieveing credentials", metric: metric, region: region, account: account});
    return
  }
  try {
    var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });
    var params = {
        "Namespace": metric.Namespace,
        "Dimensions": metric.Dimensions || []
    };

    cw.listMetrics(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        res.send(data);
      }
    });
  } catch(error){
    res.status(401).json({status: "error", msg: "Error in parameters", body: metric});
    return   
  }

});

router.post('/v1/aws/getmetrics', function (req, res) {
  const account = req.body.Config.Account || 'pro';
  const region = req.body.Config.Region;
  const metric = req.body.Metric;

  try {
    var credentials = new AWS.SharedIniFileCredentials({profile: account});
    AWS.config.update({
      region: region,
      credentials: credentials,
      httpOptions: {
        connectTimeout: 1000, // Syn Timeout
        timeout: 3000 // Inactivity timeout
      }
    });
    var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });

  } catch (error) {
    res.status(401).json({status: "error", msg: "Error retrieveing credentials"});
    return
  }

  try {
    var durationInMinutes = 60;
    var period = durationInMinutes * 60;
    var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });
    var EndTime = new Date;
    var StartTime = new Date(EndTime - 15*60*1000);
    var params = {
        "EndTime": EndTime,
        "StartTime": StartTime,
        "Period": period,
        "Namespace": metric.Namespace,
        "MetricName": metric.MetricName,
        "Dimensions": [
            {
                "Name": metric.Dimensions[0].Name,
                "Value": metric.Dimensions[0].Value
            }
        ], 
        "Statistics": metric.Statistics || ['SampleCount', 'Average', 'Sum', 'Minimum', 'Maximum'],
    };

    cw.getMetricStatistics(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            res.send(data.Datapoints[0] || {"status": "error", "msg":"No hay metricas para este objeto.\nVerifique los parametros que esta enviando en el Body.", "body": metric});
        }
    });
  } catch(error){
    res.status(401).json({status: "error", msg: "Error in parameters", body: metric});
    return   
  }
});

router.get('/v1/health', function(req, res) { 
  var environment = req.params.env || 'pro';
  res.json({ status: 'UP', env: environment }); 
});

module.exports = router;
