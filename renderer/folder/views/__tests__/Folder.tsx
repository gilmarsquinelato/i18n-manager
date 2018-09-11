import React from 'react';
import { mount } from 'enzyme';
import Immutable from 'immutable';
import Folder from '../Folder';


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

describe('folder/views/Folder', () => {
  it('mounting', () => {
    const component = mount(
      <Folder
        folder={folder}
        isSaveRequested={false}
        saveFolder={jest.fn()}
        dataChanged={jest.fn()}
        showContextMenu={jest.fn()}
        addTreeItemFinished={jest.fn()}
        removeTreeItemFinished={jest.fn()}
        isAddingTreeItem={false}
        isAddingTreeItemNode={false}
        isRemovingTreeItem={false}
        currentItemPath={Immutable.List()}
        googleTranslateAPIKey={null}
      />,
    );

    expect(component).toBeDefined();
  });
});
