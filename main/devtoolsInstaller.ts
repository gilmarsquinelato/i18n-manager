const installExtensions = async () => {
  const {
    default: installExtension,
    REDUX_DEVTOOLS,
    REACT_DEVELOPER_TOOLS
  } = require('electron-devtools-installer');

  try {
    const result = await Promise.all([
      installExtension(REDUX_DEVTOOLS),
      installExtension(REACT_DEVELOPER_TOOLS),
    ]);

    console.log('Electron DevTools Installer result:', result);
  } catch (e) {
    console.log('Electron DevTools Installer error:', e);
  }
};

export default installExtensions;
