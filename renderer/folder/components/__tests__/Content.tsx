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
        onMouseUp={jest.fn()}
        isChangedValue={jest.fn()}
        isMissingPath={jest.fn()}
        isNewPath={false}
        isTranslationEnabled={() => false}
        translateEmptyFields={jest.fn()}
        translateErrors={[]}
        isTranslating={false}
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
        onMouseUp={jest.fn()}
        isChangedValue={jest.fn().mockReturnValue(false)}
        isMissingPath={jest.fn().mockReturnValue(false)}
        isNewPath={false}
        isTranslationEnabled={() => false}
        translateEmptyFields={jest.fn()}
        translateErrors={[]}
        isTranslating={false}
      />,
    );

    expect(component).toBeDefined();
    expect(component.find('div.form-group').length).toBe(2);
    expect(component.find('div.form-group label').at(0).text()).toContain('en');
    expect(component.find('div.form-group label').at(1).text()).toContain('es');
  });

  it('changing items', () => {
    const component = mount(
      <Content
        openedPath={openedPath}
        onChange={onChange}
        folder={folder}
        onMouseUp={jest.fn()}
        isChangedValue={jest.fn().mockReturnValue(false)}
        isMissingPath={jest.fn().mockReturnValue(false)}
        isNewPath={false}
        isTranslationEnabled={() => false}
        translateEmptyFields={jest.fn()}
        translateErrors={[]}
        isTranslating={false}
      />,
    );

    const value = 'newValue';

    component.find('div.form-group input').at(0).simulate('change', { target: { value } });
    expect(onChange).toBeCalledWith('en', value);

    component.find('div.form-group input').at(1).simulate('change', { target: { value } });
    expect(onChange).toBeCalledWith('es', value);
  });
});
