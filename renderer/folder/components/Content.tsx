import React from 'react';
import Immutable from 'immutable';
import styled, { css } from 'react-emotion';
import { lightBlack, red, getStatusColor } from '~/lib/palette';
import TranslateButton from './TranslateButton';


type OnChange = (language: string, value: string) => any;
type OnMouseUp = (e: any) => any;
type IsChangedValue = (language: string) => boolean;
type IsMissingPath = (path: string[], language: string) => boolean;
type IsTranslationEnabled = () => boolean;
type TranslateEmptyFields = (language: string, text: string, path: string[]) => void;

interface IContentInputProps {
  language: string;
  value: string;
  path: string[];
  onChange: OnChange;
  onMouseUp: OnMouseUp;
  isChangedValue: IsChangedValue;
  isNewPath: boolean;
  isMissingPath: boolean;
  isTranslationEnabled: IsTranslationEnabled;
  translateEmptyFields: TranslateEmptyFields;
  isTranslating: boolean;
}

const ContentInput: React.SFC<IContentInputProps> =
  ({ language, value, onChange, onMouseUp, translateEmptyFields, path,
    isChangedValue, isNewPath, isMissingPath, isTranslationEnabled, isTranslating }) => (
      <ContentInputContainer
        className="form-group"
        isChanged={isChangedValue(language)}
        isNew={isNewPath}
        isMissing={isMissingPath}
      >
        <label htmlFor={language}>
          {language}

          <TranslateButton
            isTranslationEnabled={isTranslationEnabled}
            isTranslating={isTranslating}
            onClick={() => translateEmptyFields(language, value, path)}
          />
        </label>

        <input
          id={language}
          value={value}
          className="form-control"
          type="text"
          onChange={(e: any) => onChange(language, e.target.value)}
          onMouseUp={onMouseUp}
        />
      </ContentInputContainer>
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
  isTranslationEnabled: IsTranslationEnabled;
  translateEmptyFields: TranslateEmptyFields;
  translateErrors: string[];
  isTranslating: boolean;
}

const Content: React.SFC<IContentProps> =
  ({ openedPath, folder, translateEmptyFields,
    onChange, onMouseUp, isTranslating, translateErrors,
    isChangedValue, isNewPath, isMissingPath, isTranslationEnabled }) => (
      <ContentWrapper className="resizeable-item">
        {folder && openedPath.length > 0 &&
          folder.map((folder: any) => (
            <ContentInput
              key={folder.get('language')}
              language={folder.get('language')}
              value={folder.get('data').getIn(openedPath)}
              path={openedPath}
              onChange={onChange}
              onMouseUp={onMouseUp}
              isChangedValue={isChangedValue}
              isNewPath={isNewPath}
              isMissingPath={isMissingPath(openedPath, folder.get('language'))}
              isTranslationEnabled={isTranslationEnabled}
              translateEmptyFields={translateEmptyFields}
              isTranslating={isTranslating}
            />
          ))}

        {translateErrors.length > 0 && (
          <div className="errors my-5">
            <h5>Errors occurred when translating</h5>
            <ul>
              {translateErrors.map(error => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {isTranslating && (
          <div className="col-md-12 d-flex justify-content-center">
            <i className="fas fa-spinner fa-spin fa-2x" />
          </div>
        )}
      </ContentWrapper>
    );

export default Content;


const ContentWrapper = styled('div')`
  padding: 8px;
  background-color: ${lightBlack.toString()};
  flex: 1;
  overflow: auto;

  .errors {
    color: ${red.toString()};
  }
`;

const ContentInputContainer = styled('div')((props: any) => css`
  label {
    color: ${getStatusColor(props)};
  }

  input {
    border-color: ${getStatusColor(props)} !important;
    border-width: 2px;
  }
`);
