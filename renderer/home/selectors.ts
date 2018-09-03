const feature = 'home';

export const getRecent = (state: any) => state.getIn([feature, 'recent']);
