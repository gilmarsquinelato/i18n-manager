import * as React from 'react';
import Immutable from 'immutable';
import styled from 'react-emotion';
import _ from 'lodash';

import { lightBlack, blue } from '~/lib/palette';

import { hot } from 'react-hot-loader';


interface IProps {
  recent?: Immutable.List<string>;
  openFolder: Function;
}

class Home extends React.Component<IProps> {
  render() {
    console.log(this.props.recent);
    return (
      <div className="p-4">
        <RecentFolders>
          <h4>Recent folders</h4>
          <ul>
            {this.props.recent && this.props.recent.map((item: any) => (
              <li key={item.get('fullPath')}>
                <FolderLink
                  onClick={() => this.props.openFolder(item.get('fullPath'))}
                >
                  {item.get('folder')}
                </FolderLink>
                {item.get('path')}
              </li>
            ))}
          </ul>
        </RecentFolders>
      </div>
    );
  }
}

export default hot(module)(Home);

const RecentFolders = styled('div')`
  ul {
    padding: 0;
    list-style: none;
  }
`;

const FolderLink = styled('span')`
  color: ${blue.lighten(.2).toString()};
  cursor: pointer;
  margin-right: 8px;
`;
