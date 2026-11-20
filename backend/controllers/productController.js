const Product = require('../models/Product');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseBoolean = (value) => value === true || value === 'true';

const findProduct = async (idParam) => {
  if (/^\d+$/.test(idParam)) {
    const product = await Product.findOne({ id: Number(idParam) });
    if (product) return product;
  }
  if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
    return Product.findById(idParam);
  }
  return null;
};

const handleProductError = (res, error, fallbackMessage) => {
  if (error.code === 11000) return res.status(409).json({ message: 'A product with that SKU or ID already exists' });
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: fallbackMessage });
};

// @desc    Fetch all products with filtering, search & sorting
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, sort, bestseller } = req.query;

    const filter = { status: { $ne: 'unavailable' } };

    // Filter by Category
    if (category && category !== 'All') {
      filter.category = { $regex: new RegExp(`^${escapeRegex(category)}$`, 'i') };
    }

    // Filter by Bestseller
    if (bestseller !== undefined) {
      filter.bestseller = bestseller === 'true';
    }

    // Search by Name or Description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    // Sorting
    let sortOption = {};
    if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { date: -1, createdAt: -1 };
    } else {
      // Default: sort by id ascending
      sortOption = { id: 1, createdAt: 1 };
    }

    const products = await Product.find(filter).sort(sortOption);
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching products' });
  }
};

// @desc    Fetch single product by ID (supports numeric id or MongoDB _id)
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const idParam = req.params.id;
    const product = await findProduct(idParam);

    if (product && product.status !== 'unavailable') {
      return res.json(product);
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching product' });
  }
};

// @desc    Get all distinct product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    return res.json(['All', ...categories]);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching categories' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const body = req.body || {};
    const { name, image, description, price, discountPrice, sku, category, bestseller, countInStock, status } = body;

    if (
      typeof name !== 'string' ||
      typeof image !== 'string' ||
      typeof description !== 'string' ||
      typeof category !== 'string' ||
      typeof sku !== 'string' ||
      !name.trim() ||
      !image.trim() ||
      !description.trim() ||
      !category.trim() ||
      price === undefined ||
      !String(sku || '').trim()
    ) {
      return res.status(400).json({ message: 'Please provide all required product fields' });
    }
    const numericPrice = Number(price);
    const numericDiscountPrice = discountPrice === '' || discountPrice === null || discountPrice === undefined
      ? undefined
      : Number(discountPrice);
    const stock = countInStock === undefined ? 50 : Number(countInStock);
    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      (numericDiscountPrice !== undefined &&
        (!Number.isFinite(numericDiscountPrice) || numericDiscountPrice < 0 || numericDiscountPrice > numericPrice)) ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return res.status(400).json({ message: 'Price, discount, or stock quantity is invalid' });
    }
    if (status !== undefined && !['active', 'unavailable'].includes(status)) {
      return res.status(400).json({ message: 'Choose a valid product status' });
    }

    // Find next numeric id
    const highestProduct = await Product.findOne().sort({ id: -1 });
    const nextId = highestProduct && highestProduct.id ? highestProduct.id + 1 : 1;

    const product = new Product({
      id: body.id || nextId,
      name,
      image,
      description,
      price: numericPrice,
      discountPrice: numericDiscountPrice,
      sku: String(sku).trim().toUpperCase(),
      category: category.trim(),
      status: status || 'active',
      bestseller: parseBoolean(bestseller),
      countInStock: stock,
      date: new Date().toISOString().split('T')[0],
    });

    const createdProduct = await product.save();
    return res.status(201).json(createdProduct);
  } catch (error) {
    return handleProductError(res, error, 'Error creating product');
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const idParam = req.params.id;
    const product = await findProduct(idParam);

    if (product) {
      const { name, image, description, price, discountPrice, sku, category, bestseller, countInStock, status } = req.body || {};
      if (name !== undefined) product.name = typeof name === 'string' ? name.trim() : name;
      if (price !== undefined) product.price = Number(price);
      if (discountPrice !== undefined) {
        product.discountPrice = discountPrice === '' || discountPrice === null ? undefined : Number(discountPrice);
      }
      if (sku !== undefined) product.sku = typeof sku === 'string' ? sku.trim().toUpperCase() : sku;
      if (description !== undefined) product.description = description;
      if (image !== undefined) product.image = image;
      if (category !== undefined) product.category = typeof category === 'string' ? category.trim() : category;
      if (bestseller !== undefined) product.bestseller = parseBoolean(bestseller);
      if (countInStock !== undefined) product.countInStock = Number(countInStock);
      if (status !== undefined) product.status = status;

      if (
        !Number.isFinite(product.price) ||
        product.price < 0 ||
        (product.discountPrice !== undefined &&
          (!Number.isFinite(product.discountPrice) || product.discountPrice < 0 || product.discountPrice > product.price)) ||
        !Number.isInteger(product.countInStock) ||
        product.countInStock < 0
      ) {
        return res.status(400).json({ message: 'Price, discount, or stock quantity is invalid' });
      }

      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    return handleProductError(res, error, 'Error updating product');
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const idParam = req.params.id;
    const product = await findProduct(idParam);

    if (product) {
      await Product.findByIdAndDelete(product._id);
      return res.json({ message: 'Product removed successfully' });
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    return handleProductError(res, error, 'Error deleting product');
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};
