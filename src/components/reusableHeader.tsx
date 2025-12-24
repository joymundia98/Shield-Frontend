import React from 'react';
import { Link } from 'react-router-dom';
import './HeaderNav.css';

type NavLink = {
  name: string;
  href: string;
};

type ReusableHeaderProps = {
  links: NavLink[];
  location: { pathname: string };  // Pass location to compare with current URL
  onLogout: (e: React.MouseEvent) => void;  // Pass logout handler
};

const ReusableHeader: React.FC<ReusableHeaderProps> = ({ links, location, onLogout }) => {
  return (
    <nav>
      <div className="nav-wrapper">
        <div className="module-nav">
          <ul className="header-nav">
            {links.map((link, index) => (
              <li
                key={index}
                className={location.pathname === link.href ? 'active' : ''}  // Add active class conditionally
              >
                {/* Check if the link is the Logout link */}
                {link.href === '#logout' ? (
                  <a href={link.href} onClick={onLogout}>
                    {link.name}
                  </a>
                ) : (
                  <Link to={link.href}>
                    {link.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default ReusableHeader;
