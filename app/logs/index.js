const express = require('express');
const router = express.Router();

const saveLog = require('./save-log');

router.use(saveLog);

module.exports = router;
