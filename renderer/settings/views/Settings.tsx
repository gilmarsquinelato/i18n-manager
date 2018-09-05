import * as React from 'react';
import Immutable from 'immutable';
import styled from 'react-emotion';
import _ from 'lodash';
import { History } from 'history';
import Form, { UiSchema } from 'react-jsonschema-form';
import { JSONSchema6 } from 'json-schema';
import { hot } from 'react-hot-loader';

import { lightBlack } from '~/lib/palette';
import RemoteLink from '~/components/RemoteLink';


const translateApiKeyLink =
  'https://console.cloud.google.com/apis/credentials/wizard?api=translate.googleapis.com';


const schema: JSONSchema6 = {
  type: 'object',
  properties: {
    googleTranslateApiKey: {
      title: 'Google Translate™ API Key',
      type: 'string',
    },
  },
};

const uiSchema: UiSchema = {
  googleTranslateApiKey: {
    'ui:help': (
      <RemoteLink
        href={translateApiKeyLink}
      >
        {translateApiKeyLink}
      </RemoteLink>
    ),
  },
};

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
    !settings.equals(prevState.settings) ?
      { settings } :
      null

  handleCancel = () => {
    this.setState({
      settings: this.props.settings,
    });
  }

  handleSave = ({ formData }: any) => {
    this.props.saveSettings(formData);
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

        <div className="d-flex justify-content-center">
          <div className="col-md-6">
            <Form
              schema={schema}
              uiSchema={uiSchema}
              formData={this.state.settings.toJS()}
              onSubmit={this.handleSave}
            >
              <div className="row col-md-12 d-flex justify-content-center">
                <button
                  className="btn btn-default mx-2"
                  type="reset"
                  onClick={this.handleCancel}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary mx-2"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </Form>
          </div>
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
