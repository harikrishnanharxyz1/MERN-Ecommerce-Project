const express = require('express');
const { createTicket, getCustomerTicket } = require('../controllers/supportController');

const router = express.Router();
router.post('/', createTicket);
router.get('/:id', getCustomerTicket);

module.exports = router;
