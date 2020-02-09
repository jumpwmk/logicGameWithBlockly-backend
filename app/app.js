const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const db = require('./db');

const maps = require('./maps');
// Setting Endpoint (Middleware)
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());

// Endpoints
app.get('/', (req, res) => {
  return res.send('LOLLL');
});

app.use('/maps', maps);

module.exports = app;
