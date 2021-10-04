import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import {
  Nav,
  NavLink,
  Bars,
  NavMenu,
  NavBtn,
  NavBtnLink,
} from './NavbarElements'

const Navbar = () => {
  return (
    <BrowserRouter>
      <Nav>
        <NavLink to="/">
          <img
            style={{ width: 55 }}
            src={require('../../Logo.png').default}
            alt="logo"
          />
        </NavLink>
        <Bars />
        <NavMenu>
          <NavLink
            to={{
              pathname: 'https://discord.com/',
            }}
            target="_blank"
          >
            Discord
          </NavLink>
          <NavLink
            to={{
              pathname: 'https://instagram.com/',
            }}
            target="_blank"
          >
            Instagram
          </NavLink>
          <NavLink
            to={{
              pathname: 'https://facebook.com/',
            }}
            target="_blank"
          >
            Facebook
          </NavLink>
          <NavBtnLink to="/sign-in">Mint Now</NavBtnLink>
        </NavMenu>
      </Nav>
    </BrowserRouter>
  )
}

export default Navbar
