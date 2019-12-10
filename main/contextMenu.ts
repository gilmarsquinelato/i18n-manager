import { BrowserWindow, dialog, Menu } from 'electron';
import electronIsDev = require('electron-is-dev');

import { IContextMenuOptions } from '../typings';
import * as windowManager from './windowManager';


const webContents = (win: any) => win.webContents || win.getWebContents();

export const showContextMenu = (window: BrowserWindow, options: IContextMenuOptions) => {
  const menuTemplate: any[] = [];
  menuTemplate.push(...getTreeMenuItems(window, options));
  menuTemplate.push(...getDefaultMenuItems(window, options));

  Menu.buildFromTemplate(menuTemplate).popup();

  // const menu = Menu.buildFromTemplate(menuTemplate);
  // menu.popup({
  //   window,
  //   x: options.x,
  //   y: options.y,
  // });
};

export const getTreeMenuItems = (window: BrowserWindow, options: IContextMenuOptions): any[] => {
  if (!options.isFromTree) {
    return [];
  }

  const menuTemplate: any[] = [];

  if (options.isNode) {
    menuTemplate.push(
      {type: 'separator'},
      {
        label: 'Add Item',
        click() {
          windowManager.sendAddTreeItem(window, {
            itemId: options.itemId,
            isNode: false,
          });
        },
      },
      {
        label: 'Add Node',
        click() {
          windowManager.sendAddTreeItem(window, {
            itemId: options.itemId,
            isNode: true,
          });
        },
      },
    );
  }

  menuTemplate.push(
    {type: 'separator'},
    {
      label: 'Rename',
      click() {
        windowManager.sendRenameTreeItem(window, options.itemId);
      },
    },
    {
      label: 'Delete',
      async click() {
        const result = await dialog.showMessageBox(
          window,
          {
            type: 'question',
            buttons: ['Delete', 'Cancel'],
            message: `Are you sure to delete this item?`,
          },
        );

        if (result.response === 0) {
          windowManager.sendRemoveTreeItem(window, options.itemId);
        }
      },
    },
  );

  return menuTemplate;
};

export const getDefaultMenuItems = (window: BrowserWindow, options: IContextMenuOptions): any[] => {
  const menuTemplate: any[] = [];

  if (options.enableCut) {
    menuTemplate.push({
      role: 'cut',
      accelerator: 'CommandOrControl+X',
    });
  }

  if (options.enableCopy) {
    menuTemplate.push({
      role: 'copy',
      accelerator: 'CommandOrControl+C',
    });
  }

  if (options.enablePaste) {
    menuTemplate.push({
      role: 'paste',
      accelerator: 'CommandOrControl+V',
    });
  }

  if (electronIsDev) {
    menuTemplate.push(
      {type: 'separator'},
      {
        label: 'Inspect Element',
        click() {
          webContents(window).inspectElement(options.x, options.y);

          if (webContents(window).isDevToolsOpened()) {
            webContents(window).devToolsWebContents.focus();
          }
        },
      },
    );
  }
  return menuTemplate;
};
