var express = require('express');
var router = express.Router();
	var jwt = require('jsonwebtoken');
var present = require('present');
const logger = require('../config/logger');

function getApiHelp(req, res, next) {
    res.render('help', { title: 'Cloudwatch Wrapper', version: 'v1' });   
    logger.debug("getApiHelp - Render Cloudwatch Wrapper v1");
};

function getHealthCheck(req, res, next) {
    const t0 = present();
    res.json({ status: 1, msg:"UP", responseTime: (present()-t0), unit: "ms" }); 
    logger.debug("getHealthCheck - Data: %o", { status: 1, responseTime: (present()-t0), unit: "ms" });
};

router.get('/', getApiHelp);
router.get('/health', getHealthCheck);

module.exports = router;
