import React from 'react';
import { mount } from 'enzyme';
import Tree from '../Tree';


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
