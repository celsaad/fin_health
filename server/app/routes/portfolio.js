const express = require('express');
const router = express.Router();
const api = require('../api/portfolio');
const models = require('../setup');

router.get('/', api.find(models.Portfolio));

router.post('/', api.create);

module.exports = router;
