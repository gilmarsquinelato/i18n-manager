import React from 'react';
import styled from 'react-emotion';

import { darkBlack } from '~/lib/palette';


interface IProps {
  isActive: boolean;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavItem: React.SFC<IProps> = ({ isActive, onClick, children }) => (
  <Wrapper className="nav-item">
    <a
      className={`nav-link ${isActive ? 'active' : ''}`}
      href="#"
      onClick={onClick}
    >
      {children}
    </a>
  </Wrapper>
);

export default NavItem;

const Wrapper = styled('li')`
  .nav-link.active {
    background-color: ${darkBlack.toString()};
  }
`;
