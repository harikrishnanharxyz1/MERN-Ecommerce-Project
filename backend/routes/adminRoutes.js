const express = require('express');
const {
  getOverview,
  getAdminProducts,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCustomers,
  getCustomerOrders,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  deleteExpiredOffers,
  uploadProductImage,
} = require('../controllers/adminController');
const { getSupportTickets, updateSupportTicket } = require('../controllers/supportController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, admin);

router.get('/overview', getOverview);
router.get('/products', getAdminProducts);
router.post('/product-images', uploadProductImage);

router.route('/categories').get(getCategories).post(createCategory).put(updateCategory);
router.delete('/categories/:name', deleteCategory);

router.get('/customers', getCustomers);
router.get('/customers/:id/orders', getCustomerOrders);

router.get('/offers', getOffers);
router.delete('/offers/expired', deleteExpiredOffers);
router.post('/offers', createOffer);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

router.get('/support', getSupportTickets);
router.put('/support/:id', updateSupportTicket);

module.exports = router;
