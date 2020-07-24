var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');

function getApiHelp(req, res, next) {
    res.render('help', { title: 'Cloudwatch Wrapper', version: 'v1' });   
};

function getHealthCheck(req, res, next) { 
  var environment = req.params.env || 'pro';
  res.json({ status: 'UP' }); 
};

function ListMetrics(req, res, next) {
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
        logts("Error", err);
      } else {
        res.send(data);
      }
    });
  } catch(error){
    res.status(401).json({status: "error", msg: "Error in parameters", body: metric});
    return   
  }

};

function getMetrics(req, res, next) {
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
          logts("Error", err);
        } else {
            res.send(data.Datapoints[0] || {"status": "error", "msg":"No hay metricas para este objeto.\nVerifique los parametros que esta enviando en el Body.", "body": metric});
        }
    });
  } catch(error){
    res.status(401).json({status: "error", msg: "Error in parameters", body: metric});
    return   
  }
};

router.get('/', getApiHelp);
router.get('/v1', getApiHelp);
router.get('/v1/health', getHealthCheck);
router.get('/v1/aws/listmetrics', ListMetrics);
router.post('/v1/aws/getmetrics', getMetrics);
router.get('*', (req, res) => res.status(403).json({
  errorCode: '404',
  errorDescription: 'Ruta no encontrada'
}));

module.exports = router;
