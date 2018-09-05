import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import Folder from '../views/Folder';
import {
  getFolder,
  getFolderPath,
  isSaveRequested,
  isAddingTreeItem,
  getCurrentItemPath,
  isAddingTreeItemNode,
  isRemovingTreeItem,
} from '../selectors';
import { actions } from '../actions';

import { getGoogleTranslateAPIKey } from '~/settings/selectors';


const {
  saveFolder,
  dataChanged,
  showContextMenu,
  addTreeItemFinished,
  removeTreeItemFinished,
} = actions;

const mapStateToProps = (state: any) => ({
  folder: getFolder(state),
  folderPath: getFolderPath(state),
  isSaveRequested: isSaveRequested(state),
  isAddingTreeItem: isAddingTreeItem(state),
  isAddingTreeItemNode: isAddingTreeItemNode(state),
  currentItemPath: getCurrentItemPath(state),
  isRemovingTreeItem: isRemovingTreeItem(state),
  googleTranslateAPIKey: getGoogleTranslateAPIKey(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(
  {
    saveFolder,
    dataChanged,
    showContextMenu,
    addTreeItemFinished,
    removeTreeItemFinished,
  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(Folder);
