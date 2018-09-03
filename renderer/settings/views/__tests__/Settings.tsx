import React from 'react';
import { mount } from 'enzyme';
import Settings from '../Settings';


describe('settings/views/Settings', () => {
  it('mounting', () => {
    const component = mount(
      <Settings
        history={null}
        settings={null}
        saveSettings={() => {}}
      />,
    );

    expect(component).toBeDefined();
  });
});
