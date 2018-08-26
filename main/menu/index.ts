import { Menu } from 'electron';

import appMenu from './app';
import fileMenu from './file';
import editMenu from './edit';
import viewMenu from './view';
import windowMenu from './window';
import helpMenu from './help';

const template: any = [];
if (appMenu) {
  template.push(appMenu);
}

template.push(fileMenu);
template.push(editMenu);
template.push(viewMenu);
template.push(windowMenu);
template.push(helpMenu);


const menu = Menu.buildFromTemplate(template);

export default () => {
  Menu.setApplicationMenu(menu);
};
