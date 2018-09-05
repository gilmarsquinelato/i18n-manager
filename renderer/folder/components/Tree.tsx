import React from 'react';
import _ from 'lodash';
import { css } from 'emotion';
import styled from 'react-emotion';

import { lightBlack, yellow, blue, getStatusColor } from '~/lib/palette';
import { hot } from 'react-hot-loader';


type TreeProps = {
  tree?: any,
  collapsed?: boolean,
  level?: number,
  label?: string,
  openedPath?: string[],
  currentPath?: string[],
  isAddingTreeItem?: boolean,
  currentItemPath?: string[],
  onAddNewItem?: (path: string[], itemName: string) => void,
  onSelectItem?: (path: string[]) => void,
  isChangedPath?: (path: string[]) => boolean,
  isNewPath?: (path: string[]) => boolean,
  isMissingPath?: (path: string[]) => boolean,
  onRightClickItem?: (path: string[], x: number, y: number) => void,
  onCancelAddNewItem?: () => void,
};

interface ITreeState {
  addingItemName: string;
  addItemError: boolean;
  collapsed: boolean;
}

class Tree extends React.Component<TreeProps, ITreeState> {
  state: ITreeState = {
    addingItemName: '',
    addItemError: false,
    collapsed: false,
  };

  static defaultProps: Partial<TreeProps> = {
    collapsed: false,
    level: 0,
    currentPath: [],
  };

  static getDerivedStateFromProps = ({ isAddingTreeItem }: TreeProps, prevState: ITreeState) =>
    !isAddingTreeItem && prevState.addingItemName.length > 0 ?
      {
        addingItemName: '',
        addItemError: false,
      } :
      null

  onClick = () => {
    if (!this.isFolder()) {
      this.props.onSelectItem(this.getPath());
    } else {
      this.toggleCollapse();
    }
  }

  onMouseUp = (e: any) => {
    if (e.button === 2) {
      this.props.onRightClickItem(this.getPath(), e.pageX, e.pageY);
    }
  }

  toggleCollapse = () => this.setState({ collapsed: !this.state.collapsed });
  setCollapsed = (collapsed: boolean) => this.setState({ collapsed });

  getPath = (): string[] => this.props.currentPath;

  isFolder = () => typeof this.props.tree === 'object';
  isOpenedPath = () => _.isEqual(this.props.openedPath, this.getPath());
  isAddingItemInCurrentPath = () =>
    this.props.isAddingTreeItem &&
    _.isEqual(this.props.currentItemPath, this.getPath())

  handleAddingItemNameChange = (e: any) => {
    const addingItemName = e.target.value.replace(/\ /g, '');
    const addItemError = this.props.tree.get(addingItemName) !== undefined;
    this.setState({
      addItemError,
      addingItemName,
    });
  }

  handleAddNewItem = (e: any) => {
    if (e.key === 'Escape') {
      this.props.onCancelAddNewItem();
      this.setState({ addingItemName: '' });
    }
    if (e.key === 'Enter' && this.state.addingItemName.length > 0 && !this.state.addItemError) {
      this.props.onAddNewItem(this.getPath(), this.state.addingItemName);
      this.setCollapsed(false);
    }
  }


  getFolderIcon = () =>
    <i
      className={`icon fas ${this.state.collapsed ? 'fa-folder' : 'fa-folder-open'}`}
    />

  getCollapsibleIcon = () =>
    <i
      className={`caret-icon fas ${this.state.collapsed ? 'fa-caret-right' : 'fa-caret-down'}`}
    />

  renderAddNewItem = () => (
    <AddingItemContainer className={`form-group adding-item-name`} level={this.props.level}>
      <input
        value={this.state.addingItemName}
        onChange={this.handleAddingItemNameChange}
        onKeyUp={this.handleAddNewItem}
        autoFocus
        className={`form-control form-control-sm ${this.state.addItemError ? 'is-invalid' : ''}`}
      />
      {this.state.addItemError &&
        <div className="invalid-feedback">
          Already have an item with this name.
        </div>
      }
    </AddingItemContainer>)

  render(): React.ReactElement<any> {
    return (
      <TreeRoot>
        {this.props.label && (
          <TreeItemLabel
            className="item-label"
            onClick={this.onClick}
            onMouseUp={this.onMouseUp}
            collapsed={this.state.collapsed}
            level={this.props.level}
            isNew={this.props.isNewPath(this.getPath())}
            isChanged={this.props.isChangedPath(this.getPath())}
            isMissing={this.props.isMissingPath(this.getPath())}
            isSelected={this.isOpenedPath()}
          >
            {this.isFolder() ?
              this.getCollapsibleIcon() :
              <i className="caret-icon" />}

            {this.isFolder() ?
              this.getFolderIcon() :
              <i className={'icon fas fa-file'} />}
            {this.props.label}
          </TreeItemLabel>
        )}

        {this.isAddingItemInCurrentPath() && this.renderAddNewItem()}

        <TreeItemContainer collapsed={this.state.collapsed && !this.isAddingItemInCurrentPath()}>
          {this.isFolder() &&
            this.props.tree
              .filter((_value: any, key: string) => key.length > 0)
              .map((value: any, key: string) => (
                <Tree
                  {...this.props}
                  key={key}
                  label={key}
                  tree={value}
                  level={this.props.level + 1}
                  currentPath={[...this.props.currentPath, key]}
                />
              )).toList().toJS()}
        </TreeItemContainer>
      </TreeRoot>
    );
  }
}

export default hot(module)(Tree);


const iconFontSize = '12px';


const TreeRoot = styled('div')`
  display: flex;
  flex-direction: column;
`;

const TreeItemContainer = styled('div')((props: any) => css`
  flex: 1;
  flex-direction: column;
  display: ${props.collapsed ? 'none' : 'flex'};
`);

const TreeItemLabel = styled('span')((props: any) => css`
  display: flex;
  flex: 1;
  cursor: pointer;
  padding: 4px 4px 4px ${props.level * 16}px;
  align-items: center;
  color: ${getStatusColor(props)};
  background-color: ${props.isSelected ? lightBlack.toString() : 'transparent'};

  &:hover {
    background-color: ${lightBlack.darken(.1).toString()};
  }

  .caret-icon {
    font-size: ${iconFontSize};
    color: white;
    width: 8px;
    height: 8px;
  }

  .icon {
    font-size: ${iconFontSize};
    margin: 0 4px;
    width: 16px;
  }

  .fa-folder, .fa-folder-open {
    color: ${yellow.lighten(.2).toString()} !important;
  }

  .fa-file {
    color: ${blue.toString()} !important;
  }
`);

const AddingItemContainer = styled('div')((props: any) => css`
  padding: 4px 8px 4px ${props.level * 16 + 32}px;
  z-index: 100;
  margin-bottom: 0;
`);
