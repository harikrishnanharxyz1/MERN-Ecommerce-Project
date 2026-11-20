const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, optionalProtect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(optionalProtect, createOrder)
  .get(optionalProtect, getMyOrders);

router.get('/admin/all', protect, admin, getAllOrders);

router.route('/:id')
  .get(optionalProtect, getOrderById);

router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
