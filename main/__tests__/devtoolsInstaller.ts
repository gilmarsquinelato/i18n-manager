jest.mock('electron-devtools-installer');


describe('devtoolsInstaller', () => {

  it('installing redux and react devtools', async () => {
    const {
      default: installFn,
      REDUX_DEVTOOLS,
      REACT_DEVELOPER_TOOLS,
    } = require('electron-devtools-installer');

    await require('../devtoolsInstaller').default();

    expect(installFn).toBeCalledWith(REDUX_DEVTOOLS);
    expect(installFn).toBeCalledWith(REACT_DEVELOPER_TOOLS);
  });
});
