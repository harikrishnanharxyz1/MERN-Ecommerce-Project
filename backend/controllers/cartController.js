const Cart = require('../models/Cart');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    return res.json(cart.items);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching cart' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, size = 'One size', quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'ProductId is required' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => String(item.productId) === String(productId) && item.size === size
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        productId: String(productId),
        size,
        quantity: Number(quantity),
      });
    }

    await cart.save();
    return res.json(cart.items);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error adding to cart' });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId, size = 'One size', quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'ProductId is required' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const qty = Number(quantity);
    if (qty < 1) {
      cart.items = cart.items.filter(
        (item) => !(String(item.productId) === String(productId) && item.size === size)
      );
    } else {
      const item = cart.items.find(
        (i) => String(i.productId) === String(productId) && i.size === size
      );
      if (item) {
        item.quantity = qty;
      }
    }

    await cart.save();
    return res.json(cart.items);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error updating cart' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId/:size
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId, size } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => !(String(item.productId) === String(productId) && item.size === decodeURIComponent(size))
    );

    await cart.save();
    return res.json(cart.items);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error removing item from cart' });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.json([]);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error clearing cart' });
  }
};

// @desc    Sync local guest cart with user's backend cart on login
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res) => {
  try {
    const { localItems = [] } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Merge local items into backend cart
    for (const localItem of localItems) {
      const existing = cart.items.find(
        (item) =>
          String(item.productId) === String(localItem.productId) &&
          item.size === localItem.size
      );
      if (existing) {
        existing.quantity += Number(localItem.quantity) || 1;
      } else {
        cart.items.push({
          productId: String(localItem.productId),
          size: localItem.size || 'One size',
          quantity: Number(localItem.quantity) || 1,
        });
      }
    }

    await cart.save();
    return res.json(cart.items);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error syncing cart' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};
