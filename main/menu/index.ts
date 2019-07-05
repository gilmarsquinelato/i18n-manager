import { Menu } from 'electron';

import appMenu from './app';
import editMenu from './edit';
import fileMenu from './file';
import helpMenu from './help';
import viewMenu from './view';
import windowMenu from './window';


const getMenuTemplate = () => {
  const template: any = [];
  if (appMenu) {
    template.push(appMenu);
  }
  template.push(fileMenu());
  template.push(editMenu);
  template.push(viewMenu);
  template.push(windowMenu);
  template.push(helpMenu);
  return template;
};


export const getMenu = () => Menu.buildFromTemplate(getMenuTemplate());

export default () => {
  Menu.setApplicationMenu(getMenu());
};
