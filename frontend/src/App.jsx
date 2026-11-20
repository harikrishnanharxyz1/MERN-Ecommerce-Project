import { Routes, Route } from 'react-router-dom';

import Home from './pages/home.jsx';
import Collection from './pages/collection.jsx';
import Product from './pages/product.jsx';
import Cart from './pages/cart.jsx';
import Login from './pages/login.jsx';
import PlaceOrder from './pages/placeorder.jsx';
import Orders from './pages/orders.jsx';
import About from './pages/about.jsx';
import Contact from './pages/contact.jsx';
import Admin from './pages/admin.jsx';

import Navbar from './components/navbar.jsx';
import Footer from './components/footer.jsx';
import { ShopProvider } from './context/shop-provider.jsx';

const App = () => {
  return (
    <ShopProvider>
      <div className="min-h-screen bg-[#F2DACE] text-[#381E29] flex flex-col selection:bg-[#AA5E7A] selection:text-white">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/product" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/placeorder" element={<PlaceOrder />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ShopProvider>
  );
};

export default App;
