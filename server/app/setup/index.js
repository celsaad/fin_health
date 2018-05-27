const mongoose = require('mongoose'),
      portfolioModel = require('../models/portfolio');

const models = {
  Portfolio: mongoose.model('Portfolio')
}

module.exports = models;
