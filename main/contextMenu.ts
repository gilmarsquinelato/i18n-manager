import { BrowserWindow, Menu, dialog, clipboard } from 'electron';
import isDev from 'electron-is-dev';

import { IContextMenuOptions } from '../common/types';
import * as windowManager from './windowManager';


const webContents = (win: any) => win.webContents || win.getWebContents();

export const showContextMenu = (window: BrowserWindow, options: IContextMenuOptions) => {
  const menuTemplate: any[] = [];
  menuTemplate.push(...getTreeMenuItems(window, options));
  menuTemplate.push(...getDefaultMenuItems(window, options));

  const menu = Menu.buildFromTemplate(menuTemplate);
  menu.popup({
    window,
    x: options.x,
    y: options.y,
  });
};

export const getTreeMenuItems = (window: BrowserWindow, options: IContextMenuOptions): any[] => {
  const menuTemplate: any[] = [];

  if (!options.isFromTree) {
    return menuTemplate;
  }

  menuTemplate.push(
    { type: 'separator' },
    {
      label: 'Add Item',
      click() {
        windowManager.sendAddTreeItem(window, {
          path: options.isNode ? options.path.slice(0, -1) : options.path,
          isNode: true,
        });
      },
    },
    {
      label: 'Add Folder',
      click() {
        windowManager.sendAddTreeItem(window, {
          path: options.isNode ? options.path.slice(0, -1) : options.path,
          isNode: false,
        });
      },
    },
  );

  if (options.path.length > 0) {
    menuTemplate.push(
      { type: 'separator' },
      {
        label: 'Rename',
        click() {
          windowManager.sendRenameTreeItem(window, {
            path: options.path,
          });
        },
      },
      {
        label: 'Delete',
        click() {
          dialog.showMessageBox(
            window,
            {
              type: 'question',
              buttons: ['Delete', 'Cancel'],
              message: `Are you sure to delete the item ${options.path.join('/')}?`,
            },
            (response: number) => {
              if (response === 0) {
                windowManager.sendRemoveTreeItem(window, {
                  path: options.path,
                });
              }
            },
          );
        },
      },
    );
  }

  if (options.path.length > 0 && options.isNode) {
    menuTemplate.push(
      { type: 'separator' },
      {
        label: 'Copy Key',
        click() {
          clipboard.writeText(options.path.join('.'));
        },
      },
    );
  }

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

  if (isDev) {
    menuTemplate.push(
      { type: 'separator' },
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
