import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppNavbar from './components/Navbar'
import Footer from './components/Footer'
import CatalogPage from './pages/CatalogPage'
import DetailPage from './pages/DetailPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <Router>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/substance/:id" element={<DetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App