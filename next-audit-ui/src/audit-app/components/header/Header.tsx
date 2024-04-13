import React from 'react';
import './Header.scss'; 
import logo from './logo.svg';
import menu_arrow from './arrow.svg';
import avatar from './avatar.svg'



// Replace with your actual logo and menu icon components if available
// const LogoSVG = () => <svg /* svg props and content here */ />;
// const MenuIcon = () => <svg /* svg props and content here */ />;

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        {/* Insert your SVG logo here */}
        <img src={logo}alt="Logo"/>
        <h1>NextGen</h1>
      </div>
      <div className="search-box">
        <input
          type="text"
          id="search"
          placeholder="Search here"
        />
      </div>
      <div className="user-profile">
        <span className="avatar">
          <img src={avatar}/>
        </span>
        <span className="username">
          Chinedu Isaiah
        </span>
        <button className="menu-button">
          {/* Insert menu icon here */}
          <img src={menu_arrow}/>
        </button>
      </div>
    </header>
  );
};

export default Header;
