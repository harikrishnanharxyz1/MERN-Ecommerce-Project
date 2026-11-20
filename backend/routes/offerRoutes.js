const express = require('express');
const { getActiveOffers, validateCoupon } = require('../controllers/offerController');

const router = express.Router();
router.get('/active', getActiveOffers);
router.post('/validate', validateCoupon);

module.exports = router;
