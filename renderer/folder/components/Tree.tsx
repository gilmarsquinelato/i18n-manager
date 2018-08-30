import React from 'react';
import _ from 'lodash';
import { css } from 'emotion';
import styled from 'react-emotion';

import { lightBlack, yellow, green, red } from '~/lib/palette';
import { hot } from 'react-hot-loader';


type TreeProps = {
  tree?: any,
  collapsed?: boolean,
  level?: number,
  openedPath?: string[],
  parentPath?: string[],
  isAddingTreeItem?: boolean,
  currentItemPath?: string[],
  onAddNewItem: (path: string[], itemName: string) => void,
  onSelectItem: (path: string[]) => void,
  isChangedPath: (path: string[]) => boolean,
  isNewPath: (path: string[]) => boolean,
  isMissingPath: (path: string[]) => boolean,
  onRightClickItem: (path: string[], x: number, y: number) => void,
  onCancelAddNewItem: () => void,
};

interface ITreeState {
  itemState: any;
  addingItemName: string;
}

class Tree extends React.Component<TreeProps, ITreeState> {
  state: ITreeState = {
    itemState: {},
    addingItemName: '',
  };

  static defaultProps: Partial<TreeProps> = {
    collapsed: false,
    level: 0,
    parentPath: [],
  };

  onClick = (key: string) => () => {
    if (this.props.tree[key] === null) {
      this.props.onSelectItem(this.getPath(key));
    } else {
      this.toggleCollapse(key);
    }
  }

  onMouseUp = (key: string) => (e: any) => {
    if (e.button === 2) {
      this.props.onRightClickItem(this.getPath(key), e.pageX, e.pageY);
    }
  }

  toggleCollapse = (key: string) => this.setState({
    itemState: {
      ...this.state.itemState,
      [key]: !this.state.itemState[key],
    },
  })

  setCollapsed = (key: string, collapsed: boolean) => this.setState({
    itemState: {
      ...this.state.itemState,
      [key]: collapsed,
    },
  })

  getPath = (key: string) =>
    key.length > 0 ?
      [...this.props.parentPath, key] :
      this.props.parentPath

  isSamePath = (path1: string[], path2: string[]) => _.isEqual(path1, path2);
  isCollapsed = (key: string) => this.state.itemState[key] === true;

  getCollapsedClass = (key: string) => this.isCollapsed(key) ? 'collapsed' : '';
  getSelectedPathClass = (key: string) =>
    this.isSamePath(this.props.openedPath, this.getPath(key)) ? 'selected' : ''

  getChangedClass = (key: string) =>
    this.props.isChangedPath(this.getPath(key)) ? 'changed' : ''

  getNewClass = (key: string) =>
    this.props.isNewPath(this.getPath(key)) ? 'new' : ''

  getMissingClass = (key: string) =>
    this.props.isMissingPath(this.getPath(key)) ? 'missing' : ''

  getItemClassesByKey = (key: string) =>
    [
      this.getCollapsedClass(key),
      this.getSelectedPathClass(key),
      this.getNewClass(key),
      this.getChangedClass(key),
      this.getMissingClass(key),
    ].join(' ')

  handleAddingItemNameChange = (e: any) =>
    this.setState({ addingItemName: e.target.value.replace(/\ /g, '') })

  handleAddNewItem = (key: string) => (e: any) => {
    if (e.key === 'Escape') {
      this.props.onCancelAddNewItem();
      this.setState({ addingItemName: '' });
    }

    if (e.key === 'Enter' && this.state.addingItemName.length > 0) {
      this.props.onAddNewItem(this.getPath(key), this.state.addingItemName);
      this.setCollapsed(key, false);
    }
  }

  renderAddNewItem = (key: string = '') => (
    <AddingItemContainer
      className="form-group adding-item-name"
      level={this.props.level}
    >
      <input
        onChange={this.handleAddingItemNameChange}
        onKeyUp={this.handleAddNewItem(key)}
        autoFocus
        className="form-control form-control-sm"
      />
    </AddingItemContainer>
  )

  renderItem = (key: string): React.ReactElement<any> => (
    <TreeItem
      key={key}
      className="item"
      collapsed={this.isCollapsed(key)}
      level={this.props.level}
    >
      <TreeItemLabel
        className={`item-label ${this.getItemClassesByKey(key)}`}
        onClick={this.onClick(key)}
        onMouseUp={this.onMouseUp(key)}
        collapsed={this.isCollapsed(key)}
        level={this.props.level}
      >
        {this.props.tree[key] &&
          <i className={'collapsible-icon fas fa-caret-right'} />}

        {this.props.tree[key] ?
          <i className={`icon fas ${this.isCollapsed(key) ? 'fa-folder' : 'fa-folder-open'}`} /> :
          <i className={'icon fas fa-file'} />}
        {key}
      </TreeItemLabel>

      {this.props.isAddingTreeItem &&
        this.isSamePath(this.props.currentItemPath, this.getPath(key)) &&
        this.renderAddNewItem(key)}

      {this.props.tree[key] &&
        (<Tree
          {...this.props}
          tree={this.props.tree[key]}
          collapsed={this.state.itemState[key]}
          level={this.props.level + 1}
          parentPath={this.getPath(key)}
        />)}
    </TreeItem>
  )

  render() {
    return (
      <TreeRoot>
        {this.props.tree && Object.keys(this.props.tree).sort().map(this.renderItem)}
        {this.props.isAddingTreeItem &&
          this.props.currentItemPath.length === 0 &&
          this.props.level === 0 &&
          this.renderAddNewItem()}
      </TreeRoot>
    );
  }
}

export default hot(module)(Tree);


const TreeRoot = styled('ul')((props: any) => css`
  overflow: hidden;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  user-select: none;
  position: relative;
`);

const TreeItem = styled('li')((props: any) => css`
  display: flex;
  flex: 1;
  flex-direction: column;

  > ul {
    height: ${props.collapsed ? 0 : 'auto'};
  }

  .adding-item-name {
  }
`);

const TreeItemLabel = styled('span')((props: any) => css`
  display: flex;
  flex: 1;
  cursor: pointer;
  padding: 4px 4px 4px ${props.level * 16 + 16}px;
  align-items: center;

  &:hover {
    background-color: ${lightBlack.darken(.1).toString()};
  }

  .collapsible-icon {
    font-size: 12px;
    margin-right: 4px;
    transform: rotate(${props.collapsed ? 0 : 45}deg);
  }

  .icon {
    font-size: 12px;
    margin: 0 4px;
  }

  &.changed {
    color: ${yellow.toString()};
  }

  &.new {
    color: ${green.toString()};
  }

  &.missing {
    color: ${red.toString()};
  }

  &.selected {
    background-color: ${lightBlack.toString()};
  }
`);

const AddingItemContainer = styled('div')((props: any) => css`
  padding: 4px ${props.level * 16 + 16}px 4px ${props.level * 16 + 16}px;
  z-index: 100;
`);
