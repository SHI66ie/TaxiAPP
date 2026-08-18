import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, MessageSquare, Wallet, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/rides', icon: Compass, label: 'Rides' },
    { to: '/bids', icon: MessageSquare, label: 'Bids' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon size={20} className="nav-icon" />
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
