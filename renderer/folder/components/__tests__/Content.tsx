import React from 'react';
import { mount } from 'enzyme';
import Immutable from 'immutable';
import Content from '../Content';


const openedPath: string[] = ['language'];
const onChange = jest.fn();
const folder = Immutable.fromJS([
  {
    language: 'en',
    data: { language: 'en' },
  },
  {
    language: 'es',
    data: { language: 'es' },
  },
]);

describe('folder/components/Content', () => {
  it('mounting', () => {
    const component = mount(
      <Content
        openedPath={openedPath}
        onChange={onChange}
        isChangedValue={jest.fn()}
        isMissingPath={jest.fn()}
        isNewPath={false}
      />,
    );

    expect(component).toBeDefined();
    expect(component.children().first().hasClass('resizeable-item')).toBeTruthy();
  });

  it('rendering items', () => {
    const component = mount(
      <Content
        openedPath={openedPath}
        onChange={onChange}
        folder={folder}
        isChangedValue={jest.fn()}
        isMissingPath={jest.fn()}
        isNewPath={false}
      />,
    );

    expect(component).toBeDefined();
    expect(component.find('div.form-group').length).toBe(2);
    expect(component.find('div.form-group label').at(0).text()).toBe('en');
    expect(component.find('div.form-group label').at(1).text()).toBe('es');
  });

  it('changing items', () => {
    const component = mount(
      <Content
        openedPath={openedPath}
        onChange={onChange}
        folder={folder}
        isChangedValue={jest.fn()}
        isMissingPath={jest.fn()}
        isNewPath={false}
      />,
    );

    const value = 'newValue';

    component.find('div.form-group input').at(0).simulate('change', { target: { value } });
    expect(onChange).toBeCalledWith('en', value);

    component.find('div.form-group input').at(1).simulate('change', { target: { value } });
    expect(onChange).toBeCalledWith('es', value);
  });
});
