import React from 'react';
import './Header.scss'; 
import logo from './logo.svg';
import menu_arrow from './arrow.svg';
import avatar from './avatar.svg'
import search_icon from './search_icon.svg'
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        
        <img src={logo}alt="Logo"/>
        <NavLink to="/dashboard">Avid Audit</NavLink>
      </div>

      <div className="search-box text-base">
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
