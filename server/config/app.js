const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  morgan = require('morgan'),
  consign = require('consign'),
  cors = require('cors'),
  helmet = require('helmet'),
  app = express(),
  portfolio = require('../app/routes/portfolio'),
  config = require('./index.js'),
  database = require('./database')(mongoose, config);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(helmet());
app.use(cors());

app.use('/api/portfolio', portfolio);

module.exports = app;
