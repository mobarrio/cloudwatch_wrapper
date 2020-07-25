const express = require('express');
const router = express();

router.get('/', (req, res) => { res.json({ status: 1, msg: "0: DOWN, 1: UP" }); });

module.exports = router;
