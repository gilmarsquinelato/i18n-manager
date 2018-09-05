import React from 'react';
import Immutable from 'immutable';
import { mount } from 'enzyme';
import Settings from '../Settings';


describe('settings/views/Settings', () => {
  it('mounting', () => {
    const component = mount(
      <Settings
        history={null}
        settings={Immutable.Map()}
        saveSettings={() => {}}
      />,
    );

    expect(component).toBeDefined();
  });
});
