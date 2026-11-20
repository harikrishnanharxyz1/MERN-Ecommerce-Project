const Offer = require('../models/Offer');

const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      active: true,
      startsAt: { $lte: now },
      expiresAt: { $gt: now },
    })
      .select('name code type amount minimumOrderValue startsAt expiresAt')
      .sort({ expiresAt: 1 });
    return res.json(offers);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load active offers' });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const code = typeof req.body.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    const subtotal = Number(req.body.subtotal);
    if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
      return res.status(400).json({ message: 'Provide a coupon code and valid order subtotal.' });
    }

    const now = new Date();
    const offer = await Offer.findOne({
      code,
      active: true,
      startsAt: { $lte: now },
      expiresAt: { $gt: now },
    });
    if (!offer) return res.status(404).json({ message: 'This coupon is invalid, inactive, or expired.' });
    if (subtotal < offer.minimumOrderValue) {
      return res.status(400).json({
        message: `This coupon requires a minimum order of ₹${offer.minimumOrderValue}.`,
      });
    }

    const discount = Math.min(
      subtotal,
      offer.type === 'percentage' ? Math.round((subtotal * offer.amount) / 100) : offer.amount
    );
    return res.json({
      code: offer.code,
      name: offer.name,
      subtotal,
      discount,
      totalAfterDiscount: subtotal - discount,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not validate coupon' });
  }
};

module.exports = { getActiveOffers, validateCoupon };
