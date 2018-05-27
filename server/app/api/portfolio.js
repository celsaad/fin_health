const mongoose = require('mongoose');

const api = {};

api.find = (Portfolio) => (req, res) => {
  console.log('message');
  Portfolio.find({user_id : req.userId}, function (error, budget) {
    if (error) return res.status(400).json(error);
    res.status(200).json(portfolio);
  });
};

api.create = (User) => (req, res) => {
  User.findOne({ _id: req.userId }, function (error, user) {
    if (error) res.status(400).json(error);

    if (user) {
      const portfolio = new Portfolio({
        user_id: req.userId
      });

      portfolio.save(error => {
        if (error) return res.status(400).json(error);

        res
          .status(200)
          .json({ success: true, message: "Portfolio registered successfully" })
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid user" })
    }

  })
};

module.exports = api;
