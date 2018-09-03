import reducers from '../reducers';
import { actions } from '../actions';


describe('home/reducers', () => {
  it('SET_RECENT_FOLDERS', () => {
    const recent = ['folder1', 'folder2'];
    const action = actions.setRecentFolders(recent);

    const state = reducers(undefined, action);
    expect(state.get('recent').toJS()).toEqual(recent);
  });
});
