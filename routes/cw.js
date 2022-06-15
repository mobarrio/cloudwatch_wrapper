var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');
var present = require('present');
const logger = require('../config/logger');

function ListMetrics(req, res, next) {
  try {
    const account = req.body.Config.Account || 'ae-devops';
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
    logger.debug("ListMetrics - Body: %o", req.body);

    cw.listMetrics(metric, function(err, data) {
      if (err) {
        logger.error("ListMetrics - Error: %s", err);
        res.send({"status": "error", "msg":err, "metric": metric});
      } else {
        res.send(data);
        logger.debug("ListMetrics - Resp: %s", data);
      }
    });
  } catch (error) {
    res.status(401).json({status: "error", msg: "Error retrieveing credentials", metric: metric, region: region, account: account});
    logger.error("ListMetrics - Error: %o", error);
    return
  }
};

function getMetrics(req, res, next) {
  try {
    const account = req.body.Config.Account || 'pro';
    const region = req.body.Config.Region;
    const metric = req.body.Metric;
    var credentials = new AWS.SharedIniFileCredentials({profile: account});

    logger.debug("getMetrics - Body: %o", req.body);

    AWS.config.update({
      region: region,
      credentials: credentials,
      httpOptions: {
        connectTimeout: 1000, // Syn Timeout
        timeout: 3000 // Inactivity timeout
      }
    });

    var durationInMinutes = 60;
    var period = metric.Period || durationInMinutes * 60;
    var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });
    var EndTime = new Date;
    var StartTime = new Date(EndTime - 15*60*1000);

    var Header = {
        "EndTime": (typeof metric.EndTime === 'undefined') ? EndTime : metric.EndTime,
        "StartTime": (typeof metric.StartTime === 'undefined') ? StartTime : metric.StartTime,
        "Period": (typeof metric.Period === 'undefined') ? period : metric.Period
    };

    var params = Object.assign(Header, metric);

    logger.debug("getMetrics - Request: %o" , params);

    cw.getMetricStatistics(params, function (err, data) {
        if (err) {
          logger.error("getMetrics - Error: %s", err);
          res.send({"status": "error", "msg":err, "metric": metric, "data": data});
        } else {
            if(data.Datapoints.length > 1){
               res.send(data.Datapoints || {"status": "error", "msg":"No hay metricas para este objeto.", "metric": metric, "data": data});
               logger.debug("getMetrics - Resp: %o", data.Datapoints);
            }else{
               res.send(data.Datapoints[0] || {"status": "error", "msg":"No hay metricas para este objeto.", "metric": metric, "data": data});
               logger.debug("getMetrics - Resp: %o", data.Datapoints);
            }
               
        }
    });
  } catch (error) {
    res.status(401).json({status: "error", msg: "Error generico. Verificar la consulta realizada."});
    logger.error("getMetrics - Error: %o", error);
    return
  }
};

router.get('/listmetrics', ListMetrics);
router.post('/listmetrics', ListMetrics);
router.post('/getmetrics', getMetrics);

module.exports = router;
