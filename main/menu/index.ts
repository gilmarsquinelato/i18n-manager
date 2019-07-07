import { Menu } from 'electron';

import appMenu from './app';
import editMenu from './edit';
import fileMenu from './file';
import helpMenu from './help';
import viewMenu from './view';
import windowMenu from './window';


import MenuItem = Electron.MenuItem;
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;


const menuTemplate: Array<MenuItemConstructorOptions | MenuItem> = [];
if (Object.keys(appMenu).length > 0) {
  menuTemplate.push(appMenu);
}
menuTemplate.push(fileMenu);
menuTemplate.push(editMenu);
menuTemplate.push(viewMenu);
menuTemplate.push(windowMenu);
menuTemplate.push(helpMenu);

export const getMenu = () => Menu.buildFromTemplate(menuTemplate);

export default () => Menu.setApplicationMenu(getMenu());
