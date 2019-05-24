import { Menu } from 'electron';

import appMenu from './app';
import fileMenu from './file';
import editMenu from './edit';
import viewMenu from './view';
import windowMenu from './window';
import helpMenu from './help';



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
