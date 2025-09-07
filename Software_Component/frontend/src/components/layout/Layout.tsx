import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem,
} from 'baseui/header-navigation';
import { Button } from 'baseui/button';
import { Block } from 'baseui/block';
import { Avatar } from 'baseui/avatar';
import { StatefulPopover } from 'baseui/popover';
import { StatefulMenu } from 'baseui/menu';
import { ChevronDown } from 'baseui/icon'; 
import { StyledLink } from 'baseui/link';
import { User, Role } from '../../types/index';

import icon from '../../images/icon.png';
import data from '../../data.json';

import '../../main.css';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
}

// Theme toggle helpers
const isDarkTheme = () => document.body.classList.contains('dark-theme');
const getThemeIcon = () => (isDarkTheme() ? '🌙' : '☀️');
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
          <StyledNavigationItem key={index}>
            <StyledLink onClick={() => navigate(item.path)}>
              {item.name}
            </StyledLink>
          </StyledNavigationItem>
        ))}
      </>
    );
  };

  return (
    <Block>
      <HeaderNavigation>

        {/* Render the logo and title */}
        <StyledNavigationList $align={ALIGN.left}>
          <StyledNavigationItem>
            <Block display="flex" alignItems="center">
              <Block marginRight="0.5rem" display="flex" alignItems="center">
                <img src={icon} width={30} />
              </Block>
              <StyledLink onClick={() => navigate('/')}>
                {data.title}
              </StyledLink>
            </Block>
          </StyledNavigationItem>
        </StyledNavigationList>

        {/* Render navigation items based on user role */}
        <StyledNavigationList $align={ALIGN.center}>
          {renderNavItems()}
        </StyledNavigationList>

        {/* Render user profile and logout */}
        <StyledNavigationList $align={ALIGN.right}>
          
          {/* Theme toggle button */}
          <StyledNavigationItem>
            <Button onClick={toggleTheme} className='theme-change-btn'>
              {getThemeIcon()}
            </Button>

          </StyledNavigationItem>
          <StyledNavigationItem>
            <StatefulPopover
              content={({ close }) => (
                <StatefulMenu
                  items={[
                    {
                      label: 'Log out',
                      onClick: () => {
                        onLogout();
                        close();
                        navigate('/login');
                      },
                    },
                  ]}
                  onItemSelect={({ item }) => {
                    if (item.label === 'Log out') {
                      onLogout();
                      navigate('/login');
                    }
                    close();
                  }}
                />
              )}
            >
              <Button
                kind="tertiary"
                endEnhancer={() => <ChevronDown size={24} />}
                overrides={{
                  BaseButton: {
                    style: {
                      paddingLeft: '8px',
                      paddingRight: '8px',
                    },
                  },
                }}
              >
                <Block display="flex" alignItems="center">
                  <Avatar name={user.name} size="scale800" src="" />
                  <Block marginLeft="0.5rem">{user.name}</Block>
                </Block>
              </Button>
            </StatefulPopover>
          </StyledNavigationItem>
        </StyledNavigationList>

      </HeaderNavigation>
      
      <Block padding="2rem">
        <Outlet />
      </Block>
      
    </Block>
  );
};

export default Layout;