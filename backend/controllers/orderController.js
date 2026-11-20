const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Offer = require('../models/Offer');

const findProduct = async (id) => {
  if (/^\d+$/.test(String(id))) {
    const product = await Product.findOne({ id: Number(id) });
    if (product) return product;
  }
  if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
    return Product.findById(id);
  }
  return null;
};

const restoreReservedStock = async (reserved) => {
  await Promise.all(
    reserved.map(({ productId, quantity }) =>
      Product.updateOne({ _id: productId }, { $inc: { countInStock: quantity } })
    )
  );
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public / Optional Auth
const createOrder = async (req, res) => {
  try {
    const { customer, items, couponCode, paymentMethod } = req.body || {};

    if (!customer || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'Order must include customer details and items' });
    }

    const orderItems = [];
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Order item quantity is invalid' });
      }
      const product = await findProduct(item.productId);
      if (!product || product.status === 'unavailable') {
        return res.status(409).json({ message: 'A product in your cart is no longer available' });
      }
      if (quantity > product.countInStock) {
        return res.status(409).json({ message: `${product.name} does not have enough stock` });
      }
      orderItems.push({
        product,
        quantity,
        size: item.size || 'One size',
        price: product.discountPrice ?? product.price,
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 99;
    const normalizedCouponCode = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : '';
    let discount = 0;
    if (normalizedCouponCode) {
      const now = new Date();
      const offer = await Offer.findOne({
        code: normalizedCouponCode,
        active: true,
        startsAt: { $lte: now },
        expiresAt: { $gt: now },
      });
      if (!offer) return res.status(400).json({ message: 'This coupon is invalid, inactive, or expired.' });
      if (subtotal < offer.minimumOrderValue) {
        return res.status(400).json({ message: `This coupon requires a minimum order of ₹${offer.minimumOrderValue}.` });
      }
      discount = Math.min(
        subtotal,
        offer.type === 'percentage' ? Math.round((subtotal * offer.amount) / 100) : offer.amount
      );
    }

    const reserved = [];
    try {
      for (const item of orderItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product._id,
            countInStock: { $gte: item.quantity },
            status: { $ne: 'unavailable' },
          },
          { $inc: { countInStock: -item.quantity } },
          { new: true }
        );
        if (!updatedProduct) {
          await restoreReservedStock(reserved);
          return res.status(409).json({ message: `${item.product.name} no longer has enough stock` });
        }
        reserved.push({ productId: item.product._id, quantity: item.quantity });
      }

      const order = new Order({
        id: `FB-${Date.now().toString().slice(-8)}`,
        user: req.user ? req.user._id : null,
        customer,
        items: orderItems.map(({ product, quantity, size, price }) => ({
          productRef: product._id,
          productId: String(product.id ?? product._id),
          name: product.name,
          price,
          image: product.image,
          size,
          quantity,
        })),
        subtotal,
        shipping,
        discount,
        couponCode: normalizedCouponCode,
        total: subtotal - discount + shipping,
        paymentMethod: paymentMethod || 'COD',
        status: 'Pending',
        date: new Date(),
      });
      const savedOrder = await order.save();
      reserved.length = 0;

      if (req.user) {
        try {
          await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
        } catch (error) {
          console.error('Order saved but database cart could not be cleared.');
        }
      }

      return res.status(201).json(savedOrder);
    } catch (error) {
      await restoreReservedStock(reserved);
      throw error;
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error creating order' });
  }
};

// @desc    Get logged in user orders or orders by customer email
// @route   GET /api/orders
// @access  Public / Optional Auth
const getMyOrders = async (req, res) => {
  try {
    if (!req.user) return res.json([]);
    const filter = {
      $or: [{ user: req.user._id }, { 'customer.email': req.user.email.toLowerCase() }],
    };

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching orders' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  try {
    const idParam = req.params.id;
    let order = await Order.findOne({ id: idParam });

    if (!order && idParam.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(idParam);
    }

    if (order) {
      const canView =
        req.user &&
        (String(order.user) === String(req.user._id) ||
          order.customer.email.toLowerCase() === req.user.email.toLowerCase());
      if (!canView) return res.status(404).json({ message: 'Order not found' });
      return res.json(order);
    } else {
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching order' });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching all orders' });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const idParam = req.params.id;

    let order = await Order.findOne({ id: idParam });
    if (!order && idParam.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(idParam);
    }

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Choose a valid order status' });
    }

    if (order) {
      const shouldRestock = status === 'Cancelled' && order.status !== 'Cancelled' && !order.inventoryRestocked;
      if (shouldRestock) {
        await restoreReservedStock(
          order.items.map((item) => ({
            productId: item.productRef,
            quantity: item.quantity,
          })).filter((item) => item.productId)
        );
        order.inventoryRestocked = true;
      }
      order.status = status;
      const updatedOrder = await order.save();
      return res.json(updatedOrder);
    } else {
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error updating order status' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
