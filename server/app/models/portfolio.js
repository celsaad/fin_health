const mongoose = require('mongoose');

const Schema = mongoose.Schema({
  name: String,

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  transactions: [{
    date: { type: Date, default: Date.now },
    type: Number, //stock, fund...
    action: String, // buy, sell
    symbol: String, // symbol of stock or name of fund
    number : Number, // number of stocks/quotas
    price: Number, // price of a single unit
    commission: Number,
    notes: String
  }]
});

mongoose.model('Portfolio', Schema);
