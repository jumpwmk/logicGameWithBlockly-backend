require('dotenv').config();

const https = require('https');
const fs = require('fs');

var key = fs.readFileSync('/home/ubuntu/selfsigned.key');
var cert = fs.readFileSync('/home/ubuntu/selfsigned.crt');
var options = {
  key: key,
  cert: cert,
};

const app = require('./app');
const port = process.env.PORT || 3001;

var server_tmp = https.createServer(options, app);

const server = server_tmp.listen(port, () => {
  console.log('Express server listening on port ' + port);
});
