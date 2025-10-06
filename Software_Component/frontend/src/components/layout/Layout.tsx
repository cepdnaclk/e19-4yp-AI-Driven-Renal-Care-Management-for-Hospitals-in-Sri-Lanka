import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User, Role } from '../../types/index';

import icon from '../../images/icon.png';
import data from '../../data.json';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
}

// Theme toggle helpers
const isDarkTheme = () => document.body.classList.contains('dark-theme');
const getThemeIcon = () => (isDarkTheme() ? 'bi bi-sun' : 'bi bi-moon');
const toggleTheme = () => {
  document.body.classList.toggle('dark-theme');
  // Force update to re-render icon
  setTimeout(() => {
    const event = new Event('themechange');
    window.dispatchEvent(event);
  }, 0);
};

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [, setThemeState] = React.useState(0); // dummy state to force re-render

  React.useEffect(() => {
    const handler = () => setThemeState((s) => s + 1);
    window.addEventListener('themechange', handler);
    return () => window.removeEventListener('themechange', handler);
  }, []);

  if (!user) {
    return null;
  }

  const renderNavItems = () => {
    const role = user.role as keyof typeof data.navigation;
    const navItems = data.navigation[role];

    return (
      <>
        {navItems.map((item, index) => (
          <button
            key={index}
            className="nav-link"
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </button>
        ))}
      </>
    );
  };

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-container">

          {/* Logo and Title */}
          <div className="navbar-brand">
            <div className="navbar-logo">
              <img src={icon} alt="Logo" width={32} height={32} />
            </div>
            <button className="navbar-title" onClick={() => navigate('/')}>
              {data.title}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="navbar-nav">
            {renderNavItems()}
          </div>

          {/* User Actions */}
          <div className="navbar-actions">

            {/* Theme Toggle */}
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
              <i className={getThemeIcon()}></i>
            </button>

            {/* User Profile Dropdown */}
            <div className="user-profile-dropdown">
              <button className="user-profile-btn">
                <div className="user-avatar">
                  <span className="user-initials">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <span className="user-name">{user.name}</span>
                <i className="bi bi-chevron-down dropdown-arrow"></i>
              </button>

              <div className="dropdown-menu">
                <button
                  className="dropdown-item logout-btn"
                  onClick={() => {
                    onLogout();
                    navigate('/login');
                  }}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Log out
                </button>
              </div>
            </div>

          </div>

        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;