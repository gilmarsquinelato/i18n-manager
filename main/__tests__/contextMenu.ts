import * as testUtils from './testUtils';
import * as electron from 'electron';

import * as contextMenu from '../contextMenu';
import * as ipcMessages from '../../common/ipcMessages';
import * as windowManager from '../windowManager';


describe('contextMenu', () => {
  beforeEach(() => {
    testUtils.mockAll();
  });

  it('getting root menu items', () => {
    const options: any = {
      isFromTree: true,
      isNode: false,
      path: [],
    };

    const menuItems = contextMenu.getTreeMenuItems(null, options);

    const addItemMenu = menuItems.find(i => i.label === 'Add Item');
    const addFolderMenu = menuItems.find(i => i.label === 'Add Folder');
    expect(addItemMenu).toBeDefined();
    expect(addFolderMenu).toBeDefined();
  });

  it('getting folder menu items', () => {
    const options: any = {
      isFromTree: true,
      isNode: false,
      path: ['folder'],
    };

    const menuItems = contextMenu.getTreeMenuItems(null, options);

    const addItemMenu = menuItems.find(i => i.label === 'Add Item');
    const addFolderMenu = menuItems.find(i => i.label === 'Add Folder');
    expect(addItemMenu).toBeDefined();
    expect(addFolderMenu).toBeDefined();

    expect(menuItems.find(i => i.label === 'Delete')).toBeDefined();
  });

  it('getting node menu items', () => {
    const options: any = {
      isFromTree: true,
      isNode: true,
      path: ['folder'],
    };

    const menuItems = contextMenu.getTreeMenuItems(null, options);

    const addItemMenu = menuItems.find(i => i.label === 'Add Item');
    const addFolderMenu = menuItems.find(i => i.label === 'Add Folder');
    expect(addItemMenu).toBeUndefined();
    expect(addFolderMenu).toBeUndefined();

    expect(menuItems.find(i => i.label === 'Delete')).toBeDefined();
  });

  it('calling add item menu item', () => {
    const window: any = windowManager.createWindow();
    const options: any = {
      isFromTree: true,
      isNode: false,
      path: ['path'],
    };

    const menuItems = contextMenu.getTreeMenuItems(window, options);

    const addItemMenu = menuItems.find(i => i.label === 'Add Item');
    addItemMenu.click();

    const mockElectron = electron as any;

    expect(mockElectron.webContentsSendFunction)
      .toBeCalledWith(ipcMessages.addTreeItem, { isNode: true, path: ['path'] });
  });

  it('calling add folder menu item', () => {
    const window: any = windowManager.createWindow();
    const options: any = {
      isFromTree: true,
      isNode: false,
      path: ['path'],
    };

    const menuItems = contextMenu.getTreeMenuItems(window, options);

    const addItemMenu = menuItems.find(i => i.label === 'Add Folder');
    addItemMenu.click();

    const mockElectron = electron as any;

    expect(mockElectron.webContentsSendFunction)
      .toBeCalledWith(ipcMessages.addTreeItem, { isNode: false, path: ['path'] });
  });

  it('getDefaultMenuItems - all enabled', () => {
    const window: any = windowManager.createWindow();
    const options: any = {
      enableCut: true,
      enableCopy: true,
      enablePaste: true,
    };

    const menuItems = contextMenu.getDefaultMenuItems(window, options);
    expect(menuItems.find(i => i.role === 'cut')).toBeDefined();
    expect(menuItems.find(i => i.role === 'copy')).toBeDefined();
    expect(menuItems.find(i => i.role === 'paste')).toBeDefined();
  });

  it('getDefaultMenuItems - all disabled', () => {
    const window: any = windowManager.createWindow();
    const options: any = {
      enableCut: false,
      enableCopy: false,
      enablePaste: false,
    };

    const menuItems = contextMenu.getDefaultMenuItems(window, options);
    expect(menuItems.find(i => i.role === 'cut')).toBeUndefined();
    expect(menuItems.find(i => i.role === 'copy')).toBeUndefined();
    expect(menuItems.find(i => i.role === 'paste')).toBeUndefined();
  });
});
