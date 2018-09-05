const feature = 'settings';

export const getSettings = (state: any) => state.getIn([feature, 'settings']);
export const getGoogleTranslateAPIKey = (state: any) =>
  state.getIn([feature, 'settings', 'googleTranslateApiKey']);
