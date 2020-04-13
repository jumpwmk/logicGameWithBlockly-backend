require('dotenv').config();

const express = require('express');
const https = require('https');
const fs = require('fs');

var key = fs.readFileSync('../../selfsigned.key');
var cert = fs.readFileSync('../../selfsigned.crt');
var options = {
  key: key,
  cert: cert,
};

const app = require('./app');
const port = process.env.PORT || 3001;

var server = https.createServer(options, app);

const server = app.listen(port, () => {
  console.log('Express server listening on port ' + port);
});
