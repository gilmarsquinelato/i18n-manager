import * as windowManager from '../windowManager';

export const onPreferencesClick = () => {
  const window = windowManager.getCurrentWindow();
  if (!window) {
    return;
  }

  windowManager.sendShowSettings(window);
};
