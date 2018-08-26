import React from 'react';
import { shallow } from 'enzyme';

import App from '../App';


describe('components/App', () => {
  it('shallow mounting', () => {
    const result = shallow(<App />);
    expect(result).toBeDefined();
  });
});
