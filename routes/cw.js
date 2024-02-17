var express = require('express');
var router = express.Router();

const { CloudWatchClient, GetMetricStatisticsCommand, ListMetricsCommand } = require("@aws-sdk/client-cloudwatch");

var jwt = require('jsonwebtoken');
var present = require('present');
const logger = require('../config/logger');

function ListMetrics(req, res, next) {
  try {
    var account = req.body.Config.Account || 'ae-devops';
    var region = req.body.Config.Region;
    var metric = req.body.Metric;

    var cw  = new CloudWatchClient({ region: region });
    var command = new ListMetricsCommand(metric);

    (async () => {
      try {
        const data = await cw.send(command);
        logger.debug("APP - Module CW Function ListMetrics - Send command Response OK");
        res.send(data);
      } catch (error) {
        logger.error("APP - Module CW Function ListMetrics - Error: %s", error);
        res.send({"status": "error", "msg":error, "metric": data});
      }
    })();
  } catch (error) {
    res.status(401).json({status: "error", msg: "Error retrieveing credentials", metric: metric, region: region, account: account});
    logger.error("APP - Module CW Function ListMetrics - Error: %o", error);
    return
  }
}

function getMetrics(req, res, next) {
  try {
    var account = req.body.Config.Account || 'pro';
    var region = req.body.Config.Region;
    var metric = req.body.Metric;

    var cw  = new CloudWatchClient({ region: region });

    logger.debug("getMetrics - Body: %o", req.body);

    var durationInMinutes = 60;
    var period = metric.Period || durationInMinutes * 60;
    var EndTime = new Date;
    var StartTime = new Date(EndTime - 15*60*1000);

    var Header = {
        "EndTime": (typeof metric.EndTime === 'undefined') ? EndTime : metric.EndTime,
        "StartTime": (typeof metric.StartTime === 'undefined') ? StartTime : metric.StartTime,
        "Period": (typeof metric.Period === 'undefined') ? period : metric.Period
    };

    var params = Object.assign(Header, metric);

    logger.debug("getMetrics - Request: %o" , params);
    
    var command = new GetMetricStatisticsCommand(params);

    (async () => {
      try {
        const data = await cw.send(command);
        logger.debug("APP - Module CW Function getMetrics - Send command Response OK");
        res.send(data);
      } catch (error) {
        logger.error("APP - Module CW Function getMetrics - Error: %s", error);
        res.send({"status": "error", "msg":error, "metric": data});
      }
    })();
  } catch (error) {
    res.status(401).json({status: "error", msg: "Error generico. Verificar la consulta realizada."});
    logger.error("APP - Module CW Function getMetrics - Error: %o", error);
    return
  }
}

router.get('/listmetrics', ListMetrics);
router.post('/listmetrics', ListMetrics);
router.post('/getmetrics', getMetrics);

module.exports = router;
