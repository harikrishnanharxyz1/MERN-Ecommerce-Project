
import biegeandblack_bag from './biegeandblack_bag.png';
import black from './black.png';
import black_bag from './black_bag.png';
import blue from './blue.png';
import blue_stanley from './blue_stanley.png';
import chrome from './chrome.png';
import copper from './copper.png';
import decoration1 from './decoration1.jpg';
import decoration2 from './decoration2.jpg';
import green_stanley from './green_stanley.png';
import olive_greenshirt from './olive_greentshirt.png';
import pale_green_bottle from './pale_green_bottle.png';
import red from './red.png';

// All images
export const assets = {
  biegeandblack_bag,
  black,
  black_bag,
  blue,
  blue_stanley,
  chrome,
  copper,
  decoration1,
  decoration2,
  green_stanley,
  olive_greenshirt,
  pale_green_bottle,
  red,
};

// Product details
export const products = [
  {
    id: 1,
    name: "Beige and Black Bag",
    image: assets.biegeandblack_bag,
    description: "A stylish beige and black backpack with a modern design, perfect for everyday use and carrying your essentials.",
    price: 1299,
    category: "Accessories",
    date: "2026-11-01",
    bestseller: true,
  },
  {
    id: 2,
    name: "Black T-Shirt",
    image: assets.black,
    description: "A classic black T-shirt with a simple and versatile design, perfect for casual everyday outfits.",
    price: 599,
    category: "Clothing",
    date: "2026-11-02",
    bestseller: false,
  },
  {
    id: 3,
    name: "Black Backpack",
    image: assets.black_bag,
    description: "A sleek black backpack featuring a minimal design, ideal for daily essentials and casual outings.",
    price: 1499,
    category: "Accessories",
    date: "2026-11-03",
    bestseller: true,
  },
  {
    id: 4,
    name: "Blue T-Shirt",
    image: assets.blue,
    description: "A vibrant blue T-shirt with a clean and comfortable everyday style, easy to pair with different outfits.",
    price: 599,
    category: "Clothing",
    date: "2026-11-04",
    bestseller: false,
  },
  {
    id: 5,
    name: "Blue Stanley Bottle",
    image: assets.blue_stanley,
    description: "A stylish blue reusable bottle with a sleek design, perfect for keeping your drinks handy throughout the day.",
    price: 999,
    category: "Drinkware",
    date: "2026-11-05",
    bestseller: true,
  },
  {
    id: 6,
    name: "Chrome Bottle",
    image: assets.chrome,
    description: "A modern chrome-finish bottle with a minimalist appearance, suitable for everyday hydration.",
    price: 899,
    category: "Drinkware",
    date: "2026-11-06",
    bestseller: false,
  },
  {
    id: 7,
    name: "Copper Bottle",
    image: assets.copper,
    description: "An elegant copper-finish bottle with a premium-looking design, adding style to your everyday essentials.",
    price: 1099,
    category: "Drinkware",
    date: "2026-11-07",
    bestseller: true,
  },
  {
    id: 8,
    name: "Green Stanley Cup",
    image: assets.green_stanley,
    description: "A stylish green handled tumbler with a convenient straw and a modern design for everyday use.",
    price: 1299,
    category: "Drinkware",
    date: "2026-11-08",
    bestseller: false,
  },
  {
    id: 9,
    name: "Olive Green T-Shirt",
    image: assets.olive_greenshirt,
    description: "An olive green T-shirt with a timeless casual look, perfect for creating relaxed everyday outfits.",
    price: 599,
    category: "Clothing",
    date: "2026-11-09",
    bestseller: true,
  },
  {
    id: 10,
    name: "Pale Green Bottle",
    image: assets.pale_green_bottle,
    description: "A minimal pale green bottle with a refreshing color and elegant design, ideal for everyday hydration.",
    price: 899,
    category: "Drinkware",
    date: "2026-11-10",
    bestseller: false,
  },
  {
    id: 11,
    name: "Red T-Shirt",
    image: assets.red,
    description: "A bold red T-shirt with a simple casual design, perfect for adding a pop of color to your wardrobe.",
    price: 599,
    category: "Clothing",
    date: "2026-11-11",
    bestseller: false,
  },
];

export default {
  assets,
  products,
};
