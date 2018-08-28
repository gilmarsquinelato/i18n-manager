import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import Folder from '../views/Folder';
import { getFolder } from '../selectors';


const mapStateToProps = (state: any) => ({
  folder: getFolder(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(
  {

  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(Folder);
