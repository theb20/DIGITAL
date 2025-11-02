import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PopupProvider } from "./assets/configurations/PopupContext.jsx";

// Layout principal
import Layout from "./assets/components/layout.jsx";

// Pages
import Sign from "./assets/pages/sign.jsx";
import Reset from "./assets/pages/reset.jsx";
import Contact from "./assets/pages/contact.jsx";
import Basket from "./assets/pages/basket.jsx"; 
import Category from "./assets/pages/category.jsx";
import Card from "./assets/pages/card.jsx";
import Home from "./assets/pages/home.jsx";
import Profil from "./assets/pages/profil.jsx"
import Privacy from "./assets/pages/privacy.jsx"
import Blog from "./assets/pages/blog.jsx"
import Services from "./assets/pages/services.jsx"

// Page 404 optionnelle
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center">
    <h1 className="text-4xl font-bold mb-4 dark:text-white">404 - Page non trouvée</h1>
    <p className="text-gray-600 dark:text-gray-400">
      La page que vous cherchez n'existe pas.
    </p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen relative h-full bg-white dark:bg-gray-900 transition-colors duration-300">
      <PopupProvider>
        <Routes>
          {/* Routes avec layout global */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/sign" element={<Sign />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/basket" element={<Basket />} />
            <Route path="/category" element={<Category />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/card" element={<Card />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/services" element={<Services />} />
          </Route>

          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PopupProvider>
    </div>
  );
}

export default App;
