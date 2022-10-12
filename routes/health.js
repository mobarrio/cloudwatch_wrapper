const express = require('express');
const router = express();
const logger = require('../config/logger');

router.get('/', (req, res) => { 
    res.json({ status: 1, msg: "UP" });
    logger.debug("Health - Data: %o", { status: 1, msg: "UP" });
});

module.exports = router;
