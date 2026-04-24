import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 252, 250, 0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-soft);
  z-index: 1000;
  padding: 0 2rem;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: none;
  transition: background-color 160ms ease, border-color 160ms ease;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  transition: color 160ms ease;
  letter-spacing: 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--brand-primary);
    transition: width 160ms ease;
  }

  &:hover::after {
    width: 100%;
  }

  &:hover {
    color: var(--brand-primary);
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  align-items: center;
`;

const NavItem = styled.li`
  position: relative;
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  color: ${props => props.$isActive ? 'var(--brand-primary)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$isActive ? '700' : '500'};
  text-decoration: none;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-md);
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
  position: relative;
  font-size: 0.95rem;
  letter-spacing: 0;

  &:hover {
    color: var(--brand-primary);
    background: var(--brand-primary-pale);
    transform: translateY(-1px);
  }

  &.cta {
    background: var(--brand-primary);
    color: var(--text-inverse);
    padding: 0.7rem 1rem;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0;
    text-transform: none;
    box-shadow: none;

    &:hover {
      transform: translateY(-1px);
      box-shadow: none;
      background: var(--brand-primary-hover);
      color: var(--text-inverse);
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  transition: color 160ms ease;

  &:hover {
    color: var(--brand-primary);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  background: rgba(255, 252, 250, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-soft);
  padding: 2rem;
  transform: translateY(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 160ms ease;
  z-index: 999;
  box-shadow: var(--shadow-soft);

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MobileNavItem = styled.li``;

const MobileNavLink = styled(Link)<{ $isActive: boolean }>`
  display: block;
  color: ${props => props.$isActive ? 'var(--brand-primary)' : 'var(--text-primary)'};
  font-weight: ${props => props.$isActive ? '700' : '500'};
  text-decoration: none;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
  font-size: 1.1rem;
  letter-spacing: 0;

  &:hover {
    color: var(--brand-primary);
    background: var(--brand-primary-pale);
    transform: translateX(4px);
  }

  &.cta {
    background: var(--brand-primary);
    color: var(--text-inverse);
    text-align: center;
    font-weight: 700;
    margin-top: 1.5rem;
    text-transform: none;
    letter-spacing: 0;
    box-shadow: none;

    &:hover {
      transform: translateY(-1px);
      box-shadow: none;
      background: var(--brand-primary-hover);
      color: var(--text-inverse);
    }
  }
`;

const NavButton = styled.button`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.65rem 0.85rem;

  &:hover {
    background: var(--brand-primary-pale);
    color: var(--brand-primary);
  }
`;

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/analysis', label: 'Start Analysis', isCta: true },
    ...(user ? [{ path: '/my-results', label: 'My Results' }] : []),
    { path: '/consultation', label: 'Consultation' },
    { path: '/shopping-cart', label: 'Cart' },
    { path: '/about', label: 'About' },
    { path: '/faq', label: 'FAQ' },
    ...(!user ? [{ path: '/login', label: 'Log In' }] : []),
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <HeaderContainer>
        <Logo to="/">ColorSnap</Logo>
        
        <Nav>
          <NavList>
            {navItems.map((item) => (
              <NavItem key={item.path}>
                <NavLink 
                  to={item.path} 
                  $isActive={location.pathname === item.path}
                  className={item.isCta ? 'cta' : ''}
                >
                  {item.label}
                </NavLink>
              </NavItem>
            ))}
            {user && (
              <NavItem>
                <NavButton type="button" onClick={logout}>
                  Sign Out
                </NavButton>
              </NavItem>
            )}
          </NavList>
        </Nav>

        <MobileMenuButton onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? 'Close' : 'Menu'}
        </MobileMenuButton>
      </HeaderContainer>

      <MobileMenu $isOpen={isMobileMenuOpen}>
        <MobileNavList>
          {navItems.map((item) => (
            <MobileNavItem key={item.path}>
              <MobileNavLink 
                to={item.path} 
                $isActive={location.pathname === item.path}
                className={item.isCta ? 'cta' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </MobileNavLink>
            </MobileNavItem>
          ))}
          {user && (
            <MobileNavItem>
              <NavButton
                type="button"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign Out
              </NavButton>
            </MobileNavItem>
          )}
        </MobileNavList>
      </MobileMenu>
    </>
  );
};

export default Header;
