import Immutable from 'immutable';
import reducers from '../reducers';
import { getSettings } from '../selectors';


describe('settings/selectors', () => {
  it('getSettings', () => {
    const settings = reducers(undefined, { type: '@@INIT' });
    const state = Immutable.fromJS({ settings });

    expect(getSettings(state).equals(settings.get('settings'))).toBeTruthy();
  });
});
