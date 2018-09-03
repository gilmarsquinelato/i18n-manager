import * as React from 'react';
import Immutable from 'immutable';
import styled from 'react-emotion';
import _ from 'lodash';
import { History } from 'history';

import { lightBlack } from '~/lib/palette';

import { hot } from 'react-hot-loader';


interface IProps {
  history: History;
  settings?: Immutable.Map<string, any>;
  saveSettings: Function;
}

interface IState {
  settings?: Immutable.Map<string, any>;
}

class Settings extends React.Component<IProps, IState> {
  state: IState = {
    settings: null,
  };

  static getDerivedStateFromProps = ({ settings }: IProps, prevState: IState) =>
    !prevState.settings || prevState.settings.size === 0 || settings === null ?
      { settings } :
      null

  handleCancel = () => {
    this.setState({
      settings: this.props.settings,
    });
  }

  handleSave = () => {
    if (this.state.settings) {
      this.props.saveSettings(this.state.settings.toJS());
    }
  }

  render() {
    return (
      <div className="col-md-12 p-0">
        <Header>
          <BackButton
            className="btn btn-default"
            onClick={() => this.props.history.goBack()}
          >
            <i className="icon fas fa-chevron-left" />
            Back
          </BackButton>

          <HeaderTitle>
            Settings
          </HeaderTitle>
        </Header>

        <div className="row col-md-12 d-flex justify-content-center">
          <button
            className="btn btn-default mx-2"
            onClick={this.handleCancel}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary mx-2"
            onClick={this.handleSave}
          >
            Save
          </button>
        </div>
      </div>
    );
  }
}

export default hot(module)(Settings);

const backButtonWidth = 96;

const Header = styled('div')`
  display: flex;
`;

const BackButton = styled('button')`
  background-color: ${lightBlack.toString()};
  color: white;
  width: ${backButtonWidth}px;
  height: 48px;
  z-index: 90;

  .icon {
    margin-right: 4px;
  }
`;

const HeaderTitle = styled('h2')`
  margin-left: -${backButtonWidth}px;
  text-align: center;
  flex: 1;
`;
