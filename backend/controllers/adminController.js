const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const Category = require('../models/Category');
const Offer = require('../models/Offer');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const SupportTicket = require('../models/SupportTicket');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getOverview = async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalCustomers, lowStockProducts, pendingOrders, revenue] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments({ role: { $ne: 'admin' } }),
        Product.countDocuments({ countInStock: { $lte: 5 }, status: { $ne: 'unavailable' } }),
        Order.countDocuments({ status: { $in: ['Pending', 'Confirmed', 'Processing'] } }),
        Order.aggregate([
          { $match: { status: { $ne: 'Cancelled' } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
      ]);

    return res.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      lowStockProducts,
      pendingOrders,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not load dashboard overview' });
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const search = new RegExp(escapeRegex(String(req.query.search).trim()), 'i');
      filter.$or = [{ name: search }, { description: search }, { sku: search }];
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load products' });
  }
};

const getCategories = async (req, res) => {
  try {
    const [savedCategories, productCategories] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Product.distinct('category'),
    ]);
    const names = new Set([
      ...savedCategories.map((category) => category.name),
      ...productCategories,
    ]);
    return res.json([...names].sort((a, b) => a.localeCompare(b)));
  } catch (error) {
    return res.status(500).json({ message: 'Could not load categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const existing = await Category.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });
    if (existing) return res.status(409).json({ message: 'That category already exists' });
    const category = await Category.create({ name });
    return res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That category already exists' });
    return res.status(400).json({ message: error.message || 'Could not create category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const oldName = typeof req.body.oldName === 'string' ? req.body.oldName.trim() : '';
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (!oldName || !name) return res.status(400).json({ message: 'Current and new category names are required' });
    if (oldName.toLowerCase() !== name.toLowerCase()) {
      const duplicate = await Category.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });
      if (duplicate) return res.status(409).json({ message: 'That category already exists' });
    }

    await Product.updateMany({ category: oldName }, { $set: { category: name } });
    const category = await Category.findOneAndUpdate(
      { name: oldName },
      { $set: { name } },
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json(category);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That category already exists' });
    return res.status(400).json({ message: error.message || 'Could not update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const name = req.params.name.trim();
    const reassignTo = typeof req.query.reassignTo === 'string' ? req.query.reassignTo.trim() : '';
    const confirmDelete = req.query.confirmDelete === 'true';
    const productCount = await Product.countDocuments({ category: name });

    if (productCount && reassignTo) {
      if (reassignTo.toLowerCase() === name.toLowerCase()) {
        return res.status(400).json({ message: 'Choose a different category for reassignment' });
      }
      const categoryExists =
        (await Category.exists({ name: reassignTo })) ||
        (await Product.exists({ category: reassignTo }));
      if (!categoryExists) return res.status(400).json({ message: 'The reassignment category does not exist' });
      await Product.updateMany({ category: name }, { $set: { category: reassignTo } });
    } else if (productCount && confirmDelete) {
      await Product.deleteMany({ category: name });
    } else if (productCount) {
      return res.status(409).json({
        message: 'This category contains products. Reassign them or confirm deleting those products.',
        productCount,
      });
    }

    await Category.deleteOne({ name });
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Could not delete category' });
  }
};

const getCustomers = async (req, res) => {
  try {
    const filter = { role: { $ne: 'admin' } };
    if (req.query.search) {
      const search = new RegExp(escapeRegex(String(req.query.search).trim()), 'i');
      filter.$or = [{ name: search }, { email: search }];
    }

    const customers = await User.find(filter)
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .lean();
    const summaries = await Order.aggregate([
      { $group: { _id: { $toLower: '$customer.email' }, orderCount: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
    ]);
    const summaryByEmail = new Map(summaries.map((summary) => [summary._id, summary]));

    return res.json(
      customers.map((customer) => {
        const summary = summaryByEmail.get(customer.email.toLowerCase());
        return {
          ...customer,
          orderCount: summary?.orderCount || 0,
          totalSpent: summary?.totalSpent || 0,
        };
      })
    );
  } catch (error) {
    return res.status(500).json({ message: 'Could not load customers' });
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: { $ne: 'admin' },
    }).select('name email createdAt');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const orders = await Order.find({
      $or: [{ user: customer._id }, { 'customer.email': customer.email.toLowerCase() }],
    }).sort({ createdAt: -1 });
    return res.json({ customer, orders });
  } catch (error) {
    return res.status(400).json({ message: 'Could not load customer order history' });
  }
};

const validateOffer = (payload) => {
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const code = typeof payload.code === 'string' ? payload.code.trim().toUpperCase() : '';
  const type = payload.type;
  const amount = Number(payload.amount);
  const minimumOrderValue = Number(payload.minimumOrderValue || 0);
  const startsAt = new Date(payload.startsAt || Date.now());
  const expiresAt = new Date(payload.expiresAt);

  if (!name || !/^[A-Z0-9_-]{3,30}$/.test(code)) {
    throw new Error('Provide an offer name and a valid coupon code (3–30 letters, numbers, _ or -).');
  }
  if (!['percentage', 'fixed'].includes(type) || !Number.isFinite(amount) || amount <= 0) {
    throw new Error('Choose a valid discount type and amount.');
  }
  if (type === 'percentage' && amount > 100) {
    throw new Error('Percentage discounts cannot exceed 100%.');
  }
  if (!Number.isFinite(minimumOrderValue) || minimumOrderValue < 0) {
    throw new Error('Minimum order value must be zero or greater.');
  }
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime()) || expiresAt <= startsAt) {
    throw new Error('Choose a valid expiry date after the start date.');
  }

  return {
    name,
    code,
    type,
    amount,
    minimumOrderValue,
    startsAt,
    expiresAt,
    active: payload.active !== false && payload.active !== 'false',
  };
};

const getOffers = async (req, res) => {
  try {
    return res.json(await Offer.find().sort({ createdAt: -1 }));
  } catch (error) {
    return res.status(500).json({ message: 'Could not load offers' });
  }
};

const createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(validateOffer(req.body || {}));
    return res.status(201).json(offer);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That coupon code already exists' });
    return res.status(400).json({ message: error.message || 'Could not create offer' });
  }
};

const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    Object.assign(offer, validateOffer({ ...offer.toObject(), ...req.body }));
    await offer.save();
    return res.json(offer);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That coupon code already exists' });
    return res.status(400).json({ message: error.message || 'Could not update offer' });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    return res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Could not delete offer' });
  }
};

const deleteExpiredOffers = async (req, res) => {
  try {
    const result = await Offer.deleteMany({ expiresAt: { $lte: new Date() } });
    return res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete expired offers' });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    const match =
      typeof req.body.dataUrl === 'string' &&
      req.body.dataUrl.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) return res.status(400).json({ message: 'Upload a PNG, JPEG, or WebP image.' });

    const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({ message: 'Images must be smaller than 5 MB.' });
    }
    const validSignature =
      (extension === 'png' && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
      (extension === 'jpg' && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) ||
      (extension === 'webp' && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP');
    if (!validSignature) return res.status(400).json({ message: 'The uploaded file is not a valid image.' });

    const fileName = `product-${crypto.randomUUID()}.${extension}`;
    await fs.writeFile(path.join(__dirname, '../public/images', fileName), buffer, { flag: 'wx' });
    return res.status(201).json({ image: `/images/${fileName}` });
  } catch (error) {
    return res.status(500).json({ message: 'Could not save product image' });
  }
};

module.exports = {
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
};
