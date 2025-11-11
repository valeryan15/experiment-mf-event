import React from 'react';
import { Link } from 'react-router-dom';
import { useMicrofrontendNavigation } from '../../../features/microfrontend-manager/model/useMicrofrontendNavigation';

const Navigation: React.FC = () => {
  const { staticLinks, dynamicLinks } = useMicrofrontendNavigation();

  return (
    <nav style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
      <ul style={{ listStyle: 'none', display: 'flex', gap: '10px', margin: 0, padding: 0 }}>
        {staticLinks.map((link) => (
          <li key={link.to}>
            <Link to={link.to} style={{ textDecoration: 'none', color: '#007bff' }}>
              {link.label}
            </Link>
          </li>
        ))}
        {dynamicLinks.map((link) => (
          <li key={link.to}>
            <Link to={link.to} style={{ textDecoration: 'none', color: '#28a745' }}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;