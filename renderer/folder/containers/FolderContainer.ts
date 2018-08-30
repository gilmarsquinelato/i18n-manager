import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import Folder from '../views/Folder';
import {
  getFolder,
  isSaveRequested,
  isAddingTreeItem,
  getCurrentItemPath,
  isAddingTreeItemNode,
  isRemovingTreeItem,
} from '../selectors';
import { actions } from '../actions';


const {
  saveFolder,
  dataChanged,
  showContextMenu,
  addTreeItemFinished,
  removeTreeItemFinished,
} = actions;

const mapStateToProps = (state: any) => ({
  folder: getFolder(state),
  isSaveRequested: isSaveRequested(state),
  isAddingTreeItem: isAddingTreeItem(state),
  isAddingTreeItemNode: isAddingTreeItemNode(state),
  currentItemPath: getCurrentItemPath(state),
  isRemovingTreeItem: isRemovingTreeItem(state),
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
