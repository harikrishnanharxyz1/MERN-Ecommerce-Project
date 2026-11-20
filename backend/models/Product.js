const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide product image'],
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be positive'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price must be positive'],
      validate: {
        validator(value) {
          return value == null || value <= this.price;
        },
        message: 'Discount price cannot be greater than the original price',
      },
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'unavailable'],
      default: 'active',
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    countInStock: {
      type: Number,
      default: 50,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
