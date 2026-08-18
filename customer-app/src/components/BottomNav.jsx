import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clock, Wallet, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/activity', icon: Clock, label: 'Activity' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/account', icon: User, label: 'Account' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon size={24} className="nav-icon" />
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
