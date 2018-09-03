import React from 'react';
import Immutable from 'immutable';
import { mount } from 'enzyme';
import Home from '../Home';


describe('home/views/Home', () => {
  it('mounting', () => {
    const component = mount(
      <Home
        recent={Immutable.List()}
      />,
    );

    expect(component).toBeDefined();
  });
});
