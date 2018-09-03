import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import Home from '../views/Home';
import {
  getRecent,
} from '../selectors';
import { actions } from '../actions';

const {
  openFolder,
} = actions;

const mapStateToProps = (state: any) => ({
  recent: getRecent(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(
  {
    openFolder,
  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(Home);
