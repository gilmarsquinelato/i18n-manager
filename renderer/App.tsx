import * as React from 'react';
import styled from 'react-emotion';

import Routes from './Routes';


const Container = styled('div')`
  height: 100%;
  padding: 0;
`;

const App: React.SFC = () => (
  <Container className="container-fluid">
    <Routes />
  </Container>
);

export default App;
