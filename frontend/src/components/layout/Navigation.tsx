import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="nav">
      <Link to="/agent" className={isActive('/agent')}>
        Agent
      </Link>
      <Link to="/admin" className={isActive('/admin')}>
        Admin
      </Link>
      <Link to="/super-admin" className={isActive('/super-admin')}>
        Super Admin
      </Link>
    </nav>
  );
}
