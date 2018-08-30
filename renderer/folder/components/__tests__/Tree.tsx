import React from 'react';
import { mount } from 'enzyme';
import Immutable from 'immutable';
import Tree from '../Tree';


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

describe('folder/components/Tree', () => {
  it('mounting', () => {
    const component = mount(
      <Tree
        onAddNewItem={jest.fn()}
        onSelectItem={jest.fn()}
        isChangedPath={jest.fn()}
        isNewPath={jest.fn()}
        isMissingPath={jest.fn()}
        onRightClickItem={jest.fn()}
        onCancelAddNewItem={jest.fn()}
      />,
    );

    expect(component).toBeDefined();
  });
});
