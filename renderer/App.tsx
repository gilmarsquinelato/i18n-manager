import * as React from 'react';
import { injectGlobal } from 'emotion';
import styled from 'react-emotion';

import { darkBlack } from './lib/palette';
import Routes from './Routes';


const Container = styled('div')`
  height: 100%;
  padding: 0;
  display: flex;
`;

const App: React.SFC = () => (
  <Container className="container-fluid">
    <Routes />
  </Container>
);

export default App;


injectGlobal`
  html, body {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: ${darkBlack.toString()};
  }

  #app {
    display: flex;
    flex: 1;

    -webkit-user-select: none;
    -webkit-app-region: drag;
    animation: fadein 0.5s;
  }

  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
