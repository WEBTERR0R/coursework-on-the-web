import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppNavbar from './components/Navbar'
import Footer from './components/Footer'
import CatalogPage from './pages/CatalogPage'
import DetailPage from './pages/DetailPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RequestsPage from './pages/RequestsPage'
import RequestDetailPage from './pages/RequestDetailPage'
import ProfilePage from './pages/ProfilePage'
import ModeratorRequestsPage from './pages/ModeratorRequestsPage'

function App() {
  return (
    <Router>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/substance/:id" element={<DetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/moderator/requests" element={<ModeratorRequestsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
