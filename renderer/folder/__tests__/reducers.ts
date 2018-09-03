import reducers from '../reducers';
import { actions } from '../actions';


describe('folder/reducers', () => {
  it('LOAD_FOLDER', () => {
    const folder = [{ fileName: 'en.json' }];
    const folderPath = '/folder/path';
    const action = actions.loadFolder({ folder, folderPath });

    const state = reducers(undefined, action);
    expect(state.get('folder').toJS()).toEqual(folder);
    expect(state.get('folderPath')).toEqual(folderPath);
    expect(state.get('isSaveRequested')).toBe(false);
  });

  it('SAVE_REQUESTED = true', () => {
    const action = actions.saveRequested(true);

    const state = reducers(undefined, action);
    expect(state.get('folder').toJS()).toEqual([]);
    expect(state.get('isSaveRequested')).toBe(true);
  });

  it('SAVE_REQUESTED = false', () => {
    const action = actions.saveRequested(false);

    const state = reducers(undefined, action);
    expect(state.get('folder').toJS()).toEqual([]);
    expect(state.get('isSaveRequested')).toBe(false);
  });
});
