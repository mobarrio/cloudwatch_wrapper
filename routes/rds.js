var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');
var present = require('present');
const logger = require('../config/logger');

function extraeClaves(Filter, jsonx){
 for (var clave in jsonx) {
   if(!jsonx[clave] || typeof jsonx[clave] !== "object"){
     if(Filter.indexOf(clave) == -1 && Filter.length !== 0)
       delete jsonx[clave]
   } else {
     if(Object.keys(jsonx[clave]).length === 0 || jsonx[clave].length === 0)
       delete jsonx[clave]
     extraeClaves(Filter,jsonx[clave])
     if(typeof jsonx[clave] === "object" ){
       if(!Object.keys(jsonx[clave]).length )
         delete jsonx[clave]
     }
   }
 }
 return(jsonx)
}

/*
 Method: post
 Path: /api/v1/aws/rds/describeRDS
 Body:
  {
    "Config": {
        "Account": "pro",
        "Region": "eu-west-1"
    },
    "Filter": [ "DBInstanceIdentifier", "Engine", "DBInstanceStatus", "DBName", "Endpoint", "EngineVersion", "Address", "Port","PreferredBackupWindow"]
  }
 Return:
  [
    {
        "DBInstanceIdentifier": "db1-rds-dev-mysql",
        "Engine": "mysql",
        "DBInstanceStatus": "available",
        "Endpoint": {
            "Address": "xxxxx.eu-west-1.rds.amazonaws.com",
            "Port": 3306
        },
        "PreferredBackupWindow": "01:00-03:00",
        "EngineVersion": "5.7.39"
    },
    {
        "DBInstanceIdentifier": "db2-rds-dev-postgres",
        "Engine": "postgres",
        "DBInstanceStatus": "available",
        "DBName": "aeprestg",
        "Endpoint": {
            "Address": "xxxxx.eu-west-1.rds.amazonaws.com",
            "Port": 5432
        },
        "PreferredBackupWindow": "21:00-21:30",
        "EngineVersion": "13.7"
    }
  ]
**/

function describeRDS(req, res, next) {
  try {
    const account = req.body.Config.Account || 'pro';
    const region = req.body.Config.Region;
    const filter = req.body.Filter;
    var credentials = new AWS.SharedIniFileCredentials({profile: account});

    AWS.config.update({
      region: region,
      credentials: credentials,
      httpOptions: {
        connectTimeout: 5000, // Syn Timeout
        timeout: 30000 // Inactivity timeout
      }
    });

    // Crear una instancia de AmazonRDS
    var rds = new AWS.RDS();
    rds.describeDBInstances(function(err, data) {
      if (err) {
        logger.error("DescribeRDS - Error: %s", err);
        res.send({"status": "error", "msg":err, region: region, account: account});
      } else {
        res.send(extraeClaves(filter,data.DBInstances));
      }
    });

  } catch (error) {
    res.status(401).json({status: "error", msg: "Error retrieveing credentials", region: region, account: account});
    logger.error("ListMetrics - Error: %o", error);
    return
  }

}

router.post('/describeRDS', describeRDS);

module.exports = router;
