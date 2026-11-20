const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');
const ensureAdmin = require('../config/ensureAdmin');

dotenv.config({ path: path.join(__dirname, '../.env') });

const initialProducts = [
  {
    id: 1,
    name: 'Beige and Black Bag',
    image: '/images/biegeandblack_bag.png',
    description: 'A stylish beige and black backpack with a modern design, perfect for everyday use and carrying your essentials.',
    price: 1299,
    category: 'Accessories',
    date: '2026-11-01',
    bestseller: true,
    countInStock: 25,
  },
  {
    id: 2,
    name: 'Black T-Shirt',
    image: '/images/black.png',
    description: 'A classic black T-shirt with a simple and versatile design, perfect for casual everyday outfits.',
    price: 599,
    category: 'Clothing',
    date: '2026-11-02',
    bestseller: false,
    countInStock: 50,
  },
  {
    id: 3,
    name: 'Black Backpack',
    image: '/images/black_bag.png',
    description: 'A sleek black backpack featuring a minimal design, ideal for daily essentials and casual outings.',
    price: 1499,
    category: 'Accessories',
    date: '2026-11-03',
    bestseller: true,
    countInStock: 20,
  },
  {
    id: 4,
    name: 'Blue T-Shirt',
    image: '/images/blue.png',
    description: 'A vibrant blue T-shirt with a clean and comfortable everyday style, easy to pair with different outfits.',
    price: 599,
    category: 'Clothing',
    date: '2026-11-04',
    bestseller: false,
    countInStock: 40,
  },
  {
    id: 5,
    name: 'Blue Stanley Bottle',
    image: '/images/blue_stanley.png',
    description: 'A stylish blue reusable bottle with a sleek design, perfect for keeping your drinks handy throughout the day.',
    price: 999,
    category: 'Drinkware',
    date: '2026-11-05',
    bestseller: true,
    countInStock: 30,
  },
  {
    id: 6,
    name: 'Chrome Bottle',
    image: '/images/chrome.png',
    description: 'A modern chrome-finish bottle with a minimalist appearance, suitable for everyday hydration.',
    price: 899,
    category: 'Drinkware',
    date: '2026-11-06',
    bestseller: false,
    countInStock: 35,
  },
  {
    id: 7,
    name: 'Copper Bottle',
    image: '/images/copper.png',
    description: 'An elegant copper-finish bottle with a premium-looking design, adding style to your everyday essentials.',
    price: 1099,
    category: 'Drinkware',
    date: '2026-11-07',
    bestseller: true,
    countInStock: 15,
  },
  {
    id: 8,
    name: 'Green Stanley Cup',
    image: '/images/green_stanley.png',
    description: 'A stylish green handled tumbler with a convenient straw and a modern design for everyday use.',
    price: 1299,
    category: 'Drinkware',
    date: '2026-11-08',
    bestseller: false,
    countInStock: 25,
  },
  {
    id: 9,
    name: 'Olive Green T-Shirt',
    image: '/images/olive_greentshirt.png',
    description: 'An olive green T-shirt with a timeless casual look, perfect for creating relaxed everyday outfits.',
    price: 599,
    category: 'Clothing',
    date: '2026-11-09',
    bestseller: true,
    countInStock: 45,
  },
  {
    id: 10,
    name: 'Pale Green Bottle',
    image: '/images/pale_green_bottle.png',
    description: 'A minimal pale green bottle with a refreshing color and elegant design, ideal for everyday hydration.',
    price: 899,
    category: 'Drinkware',
    date: '2026-11-10',
    bestseller: false,
    countInStock: 30,
  },
  {
    id: 11,
    name: 'Red T-Shirt',
    image: '/images/red.png',
    description: 'A bold red T-shirt with a simple casual design, perfect for adding a pop of color to your wardrobe.',
    price: 599,
    category: 'Clothing',
    date: '2026-11-11',
    bestseller: false,
    countInStock: 50,
  },
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding.');

    await Product.bulkWrite(
      initialProducts.map((product) => ({
        updateOne: {
          filter: { id: product.id },
          update: { $setOnInsert: product },
          upsert: true,
        },
      }))
    );
    await ensureAdmin();

    console.log('Data Imported Successfully!');
    console.log(`- ${initialProducts.length} catalog products checked or added`);
    process.exit(0);
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany();

    console.log('Catalog products removed. Accounts, orders, and carts were preserved.');
    process.exit(0);
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
