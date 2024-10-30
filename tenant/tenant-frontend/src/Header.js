import React from 'react';
import './Header.css'; // Import CSS for styling
import dbklLogo from './Assets/dbkl-logo.png';
import dbklLogo2 from './Assets/dbkl-logo2.png';
const Header = () => {
    return (
    <header className="header">
      <div className="logo-text">Dewan Bandaraya Kuala Lumpur (DBKL)</div>
      <div className="logo-container">
        <img src={dbklLogo} alt="Logo 1" className="logo" />
        <img src={dbklLogo2} alt="Logo 2" className="logo" />
      </div>
    </header>
  );
};

export default Header;
