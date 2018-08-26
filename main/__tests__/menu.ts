import * as testUtils from './testUtils';
import * as electron from 'electron';


describe('menu', () => {
  beforeEach(() => {
    testUtils.mockAll();
  });

  it('loading menu', async () => {
    const loadMenu = require('../menu').default;
    loadMenu();
    expect(electron.Menu.buildFromTemplate).toBeCalled();
    expect(electron.Menu.setApplicationMenu).toBeCalled();
  });
});
