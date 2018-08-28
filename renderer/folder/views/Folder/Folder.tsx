import * as React from 'react';
import Immutable from 'immutable';
import styled from 'react-emotion';

import { lightBlack, darkBlack } from '~/lib/palette';
import buildTree from './treeBuilder';

import Tree from '../../components/Tree';
import Content from '../../components/Content';


const minTreeWidth = 400;
const resizerWidth = 8;

interface IProps {
  folder?: Immutable.List<any>;
}

interface IState {
  folder: Immutable.List<any>;
  openedPath: string[];
  isDragging: boolean;
  treeWidth: number;
}

class Folder extends React.Component<IProps, IState> {
  state: IState = {
    folder: null,
    openedPath: [],
    isDragging: false,
    treeWidth: minTreeWidth,
  };

  static getDerivedStateFromProps = ({ folder }: IProps, prevState: IState) =>
    !prevState.folder || prevState.folder.size !== folder.size ? { folder } : null

  componentDidMount() {
    document.addEventListener('mouseleave', () => {
      this.setState({ isDragging: false });
    });
  }

  setIsDragging = (isDragging: boolean) => this.setState({ isDragging });

  onSelectItem = (path: string[]) => {
    this.setState({ openedPath: path });
  }

  getLanguageIndex = (language: string) =>
    this.state.folder.indexOf(
      this.state.folder.find(i => i.get('language') === language),
    )

  onChange = (language: string, value: string) => {
    const folder = this.state.folder.setIn(
      [this.getLanguageIndex(language), 'data', ...this.state.openedPath],
      value,
    );

    this.setState({ folder });
  }

  renderTree = () => (
    <div
      className="resizeable-item"
      style={{
        backgroundColor: darkBlack.toString(),
        minWidth: minTreeWidth,
        width: this.state.treeWidth,
      }}
    >
      <Tree
        tree={buildTree(this.state.folder)}
        onSelectItem={this.onSelectItem}
        openedPath={this.state.openedPath}
      />
    </div>
  )

  render() {
    return (
      <FolderRoot>
        <div
          className={`resizeable-panel ${this.state.isDragging ? 'dragging' : ''}`}
          onMouseUp={() => this.setIsDragging(false)}
          onMouseMove={(e: any) => {
            if (this.state.isDragging) {
              this.setState({ treeWidth: e.pageX - resizerWidth / 2 });
            }
          }}
        >
          {this.renderTree()}

          <div
            className="drag-item"
            onMouseDown={() => this.setIsDragging(true)}
          />

          <Content
            openedPath={this.state.openedPath}
            folder={this.state.folder}
            onChange={this.onChange}
          />
        </div>
      </FolderRoot >
    );
  }
}

export default Folder;


const FolderRoot = styled('div')`
  display: flex;
  flex: 1;

  .content-pane {
    padding: 32px;
  }

  .resizeable-panel {
    display: flex;
    flex-direction: row;
    flex: 1;

    &.dragging {
      cursor: col-resize;
    }

    .resizeable-item {

    }

    .drag-item {
      width: ${resizerWidth}px;
      background: ${lightBlack.toString()};
      cursor: col-resize;
    }
  }
`;
