import Immutable from 'immutable';
import reducers from '../reducers';
import { getFolder, isSaveRequested } from '../selectors';


describe('folder/selectors', () => {
  it('getFolder', () => {
    const folder = reducers(undefined, { type: '@@INIT' });
    const state = Immutable.fromJS({ folder });

    expect(getFolder(state).equals(folder.get('folder'))).toBeTruthy();
  });

  it('isSaveRequested', () => {
    const folder = reducers(undefined, { type: '@@INIT' });
    const state = Immutable.fromJS({ folder });

    expect(isSaveRequested(state)).toBe(folder.get('isSaveRequested'));
  });
});
