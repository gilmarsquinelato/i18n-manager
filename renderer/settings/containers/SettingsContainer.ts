import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import Settings from '../views/Settings';
import {
  getSettings,
} from '../selectors';
import { actions } from '../actions';


const {
  saveSettings,
} = actions;

const mapStateToProps = (state: any) => ({
  settings: getSettings(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators(
  {
    saveSettings,
  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
