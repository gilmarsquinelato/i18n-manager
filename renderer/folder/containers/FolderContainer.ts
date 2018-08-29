import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import Folder from '../views/Folder';
import { getFolder, isSaveRequested } from '../selectors';
import { actions } from '../actions';


const { saveFolder } = actions;

const mapStateToProps = (state: any) => ({
  folder: getFolder(state),
  isSaveRequested: isSaveRequested(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(
  {
    saveFolder,
  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(Folder);
