import reducers from '../reducers';
import { actions } from '../actions';


describe('settings/reducers', () => {
  it('SET_SETTINGS', () => {
    const settings = { key: 'value' };
    const action = actions.setSettings(settings);

    const state = reducers(undefined, action);
    expect(state.get('settings').toJS()).toEqual(settings);
  });
});
