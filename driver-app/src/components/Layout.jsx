import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = () => {
  return (
    <div className="app-shell">
      <main className="page-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
