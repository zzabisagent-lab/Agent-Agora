const express = require('express');
const flexAuth = require('../middleware/flexAuth');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/', flexAuth, searchController.search);

module.exports = router;
