var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');
var present = require('present');

function getApiHelp(req, res, next) {
    res.render('help', { title: 'Cloudwatch Wrapper', version: 'v1' });   
};

function getHealthCheck(req, res, next) {
  try {
    const t0 = present();
    const account = req.body.Config.Account || 'pro';
    const region = req.body.Config.Region;
    const metric = req.body.Metric;

    var credentials = new AWS.SharedIniFileCredentials({profile: account});
    AWS.config.update({
      region: region,
      credentials: credentials,
      httpOptions: {
        connectTimeout: 1000, // Syn Timeout
        timeout: 3000 // Inactivity timeout
      }
    });

<<<<<<< Updated upstream
    var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });
    cw.listMetrics(metric, function(err, data) {
=======
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
>>>>>>> Stashed changes
      if (err) {
        logts("Error", err);
        res.json({ status: 0, msg: err, responseTime: (present()-t0), unit: "ms" }); 
      } else {
        res.json({ status: 1, responseTime: (present()-t0), unit: "ms" }); 
      }
    });

  } catch (error) {
    res.status(401).json({status: 0, msg: "Error retrieveing credentials", responseTime: (present()-t0), unit: "ms", metric: metric, region: region, account: account});
    return
  }
};

function ListMetrics(req, res, next) {
  try {
    const account = req.body.Config.Account || 'pro';
    const region = req.body.Config.Region;
    const metric = req.body.Metric;
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
    var params = {};
    params.Namespace = metric.Namespace;
    if(typeof metric.MetricName === "string") { params.MetricName = metric.MetricName; }
    params.Dimensions = metric.Dimensions || [];

    cw.listMetrics(params, function(err, data) {
      if (err) {
        logts("Error", err);
      } else {
        res.send(data);
      }
    });
  } catch (error) {
    res.status(401).json({status: "error", msg: "Error retrieveing credentials", metric: metric, region: region, account: account});
    return
  }
};

function getMetrics(req, res, next) {
  try {
    const account = req.body.Config.Account || 'pro';
    const region = req.body.Config.Region;
    const metric = req.body.Metric;

    var credentials = new AWS.SharedIniFileCredentials({profile: account});
    AWS.config.update({
      region: region,
      credentials: credentials,
      httpOptions: {
        connectTimeout: 1000, // Syn Timeout
        timeout: 3000 // Inactivity timeout
      }
    });

// 86400 Seconds. (1 day = 86400 seconds.)
//--start-time 2016-10-19T00:00:00Z --end-time 2016-10-20T00:00:00Z 

    var durationInMinutes = 60;
    var period = durationInMinutes * 60;
    var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });
    var EndTime = new Date;
    var StartTime = new Date(EndTime - 15*60*1000);
    var params = {
        "EndTime": (typeof metric.EndTime === 'undefined') ? EndTime : metric.EndTime,
        "StartTime": (typeof metric.StartTime === 'undefined') ? StartTime : metric.StartTime,
        "Period": (typeof metric.Period === 'undefined') ? period : metric.Period,
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
          logts("Error", err);
        } else {
            res.send(data.Datapoints[0] || {"status": "error", "msg":"No hay metricas para este objeto.\nVerifique los parametros que esta enviando en el Body.", "body": metric});
        }
    });
  } catch (error) {
    res.status(401).json({status: "error", msg: "Error retrieveing credentials"});
    return
  }
};

function Dummy(rreq, res, next){
  res.status(404).json({status: "error", msg: "Ruta no encontrada"});
  return
};

router.get('/', getApiHelp);
router.get('/v1', getApiHelp);
router.get('/v1/health', getHealthCheck);
router.get('/v1/aws/listmetrics', ListMetrics);
router.get('/v1/aws/getmetrics', Dummy);
router.post('/v1/aws/getmetrics', getMetrics);
router.get('*', (req, res) => res.status(403).json({
  errorCode: '404',
  errorDescription: 'Ruta no encontrada'
}));

module.exports = router;
