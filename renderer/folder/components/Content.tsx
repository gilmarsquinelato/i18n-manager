import React from 'react';
import Immutable from 'immutable';
import styled from 'react-emotion';
import { lightBlack } from '~/lib/palette';


type OnChange = (language: string, value: string) => any;

interface IContentInputProps {
  language: string;
  value: string;
  onChange: OnChange;
}

const ContentInput: React.SFC<IContentInputProps> = ({ language, value, onChange }) => (
  <div className="form-group">
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
}

const Content: React.SFC<IContentProps> = ({ openedPath, folder, onChange }) => (
  <ContentWrapper className="resizeable-item">
    {folder && openedPath.length > 0 &&
      folder.map((folder: any) => (
        <ContentInput
          key={folder.get('language')}
          language={folder.get('language')}
          value={folder.get('data').getIn(openedPath)}
          onChange={onChange}
        />
      ))}
  </ContentWrapper>
);

export default Content;

const ContentWrapper = styled('div')`
  padding: 8px;
  background-color: ${lightBlack.toString()};
  flex: 1;
`;
