'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

interface NavbarProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export default function Navbar({ cartItemCount, onCartClick }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Company Name */}
        <div className="navbar-brand">
          <div className="brand-content">
            <h1 className="brand-title">CHAIRBORD</h1>
            <p className="brand-subtitle">Private Limited</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <div className="nav-actions">
            <button 
              onClick={onCartClick} 
              className="nav-cart-button"
            >
              <span className="cart-icon">🛒</span>
              <span className="cart-text">Cart</span>
              {cartItemCount > 0 && (
                <span className="nav-cart-badge">{cartItemCount}</span>
              )}
            </button>
            <button onClick={handleLogout} className="nav-logout-button">
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <button 
            onClick={() => {
              onCartClick();
              setIsMobileMenuOpen(false);
            }} 
            className="mobile-menu-item"
          >
            <span className="menu-icon">🛒</span>
            <span>Cart {cartItemCount > 0 && `(${cartItemCount})`}</span>
          </button>
          <button 
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }} 
            className="mobile-menu-item"
          >
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

