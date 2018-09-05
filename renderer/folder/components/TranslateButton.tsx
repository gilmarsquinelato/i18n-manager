import React from 'react';
import styled from 'react-emotion';
import { red } from '~/lib/palette';


interface IProps {
  isTranslationEnabled: () => boolean;
  isTranslating: boolean;
  onClick: any;
}

const TranslateButton: React.SFC<IProps> = ({ isTranslationEnabled, isTranslating, onClick }) => (
  <Container className="d-inline-block">
    <button
      className="btn btn-outline-info translate-button"
      disabled={!isTranslationEnabled() || isTranslating}
      onClick={onClick}
    >
      <i className="fas fa-language" />
      Translate empty fields
    </button>

    {!isTranslationEnabled() && <small>Google Translate™ API is not configured</small>}
  </Container>
);

export default TranslateButton;

const Container = styled('div')`
  .translate-button {
    margin-left: 8px;
    padding: 0.05rem 0.75rem;

    .fas {
      font-size: 24px;
      margin-right: 8px;
    }
  }

  small {
    color: ${red.lighten(.5).toString()};
    margin-left: 4px;
  }
`;
