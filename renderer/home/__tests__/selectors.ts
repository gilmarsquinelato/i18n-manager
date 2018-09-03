import Immutable from 'immutable';
import reducers from '../reducers';
import { getRecent } from '../selectors';


describe('home/selectors', () => {
  it('getRecent', () => {
    const home = reducers(undefined, { type: '@@INIT' });
    const state = Immutable.fromJS({ home });

    expect(getRecent(state).equals(home.get('recent'))).toBeTruthy();
  });
});
