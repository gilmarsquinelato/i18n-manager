import React from 'react';
import Immutable from 'immutable';
import styled from 'react-emotion';
import { lightBlack, yellow, green, red } from '~/lib/palette';


type OnChange = (language: string, value: string) => any;
type IsChangedValue = (language: string) => boolean;
type IsMissingPath = (path: string[], language: string) => boolean;

interface IContentInputProps {
  language: string;
  value: string;
  onChange: OnChange;
  isChangedValue: IsChangedValue;
  isNewPath: boolean;
  isMissingPath: boolean;
}

const ContentInput: React.SFC<IContentInputProps> =
  ({ language, value, onChange, isChangedValue, isNewPath, isMissingPath }) => (
    <div
      className={`
        form-group
        ${isChangedValue(language) ? 'changed' : ''}
        ${isNewPath ? 'new' : ''}
        ${isMissingPath ? 'missing' : ''}
      `}
    >
      <label htmlFor={language}>
        {language}
      </label>

      <input
        id={language}
        value={value}
        className="form-control"
        type="text"
        onChange={(e: any) => onChange(language, e.target.value)}
      />
    </div>
  );
ContentInput.defaultProps = {
  value: '',
};


interface IContentProps {
  folder?: Immutable.List<any>;
  openedPath: string[];
  onChange: OnChange;
  isChangedValue: IsChangedValue;
  isNewPath: boolean;
  isMissingPath: IsMissingPath;
}

const Content: React.SFC<IContentProps> =
  ({ openedPath, folder, onChange, isChangedValue, isNewPath, isMissingPath }) => (
    <ContentWrapper className="resizeable-item">
      {folder && openedPath.length > 0 &&
        folder.map((folder: any) => (
          <ContentInput
            key={folder.get('language')}
            language={folder.get('language')}
            value={folder.get('data').getIn(openedPath)}
            onChange={onChange}
            isChangedValue={isChangedValue}
            isNewPath={isNewPath}
            isMissingPath={isMissingPath(openedPath, folder.get('language'))}
          />
        ))}
    </ContentWrapper>
  );

export default Content;

const ContentWrapper = styled('div')`
  padding: 8px;
  background-color: ${lightBlack.toString()};
  flex: 1;
  overflow: auto;

  .form-group.changed {
    label {
      color: ${yellow.toString()};
    }

    input {
      border-color: ${yellow.toString()};
      border-width: 2px;
    }
  }

  .form-group.new {
    label {
      color: ${green.toString()};
    }

    input {
      border-color: ${green.toString()};
      border-width: 2px;
    }
  }

  .form-group.missing {
    label {
      color: ${red.toString()};
    }

    input {
      border-color: ${red.toString()};
      border-width: 2px;
    }
  }
`;
