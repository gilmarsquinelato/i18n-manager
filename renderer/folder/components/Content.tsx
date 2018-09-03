import React from 'react';
import Immutable from 'immutable';
import styled, { css } from 'react-emotion';
import Color from 'color';
import { lightBlack, yellow, green, red } from '~/lib/palette';


type OnChange = (language: string, value: string) => any;
type OnMouseUp = (e: any) => any;
type IsChangedValue = (language: string) => boolean;
type IsMissingPath = (path: string[], language: string) => boolean;

interface IContentInputProps {
  language: string;
  value: string;
  onChange: OnChange;
  onMouseUp: OnMouseUp;
  isChangedValue: IsChangedValue;
  isNewPath: boolean;
  isMissingPath: boolean;
}

const ContentInput: React.SFC<IContentInputProps> =
  ({ language, value, onChange, isChangedValue, isNewPath, isMissingPath, onMouseUp }) => (
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
        onMouseUp={onMouseUp}
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
  onMouseUp: OnMouseUp;
  isChangedValue: IsChangedValue;
  isNewPath: boolean;
  isMissingPath: IsMissingPath;
}

const Content: React.SFC<IContentProps> =
  ({ openedPath, folder, onChange, isChangedValue, isNewPath, isMissingPath, onMouseUp }) => (
    <ContentWrapper className="resizeable-item">
      {folder && openedPath.length > 0 &&
        folder.map((folder: any) => (
          <ContentInput
            key={folder.get('language')}
            language={folder.get('language')}
            value={folder.get('data').getIn(openedPath)}
            onChange={onChange}
            onMouseUp={onMouseUp}
            isChangedValue={isChangedValue}
            isNewPath={isNewPath}
            isMissingPath={isMissingPath(openedPath, folder.get('language'))}
          />
        ))}
    </ContentWrapper>
  );

export default Content;


const formGroupColor = (className: string, color: Color) => css`
  .form-group.${className} {
    label {
      color: ${color.toString()};
    }

    input {
      border-color: ${color.toString()};
      border-width: 2px;
    }
  }
`;

const ContentWrapper = styled('div')`
  padding: 8px;
  background-color: ${lightBlack.toString()};
  flex: 1;
  overflow: auto;

  ${formGroupColor('changed', yellow)}
  ${formGroupColor('new', green)}
  ${formGroupColor('missing', red)}
`;
