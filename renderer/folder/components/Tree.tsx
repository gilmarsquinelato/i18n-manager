import React from 'react';
import _ from 'lodash';
import { css } from 'emotion';
import styled from 'react-emotion';

import { lightBlack } from '~/lib/palette';


type TreeProps = {
  tree?: any,
  collapsed?: boolean,
  level?: number,
  openedPath?: string[],
  parentPath?: string[],
  onSelectItem: (path: string[]) => void,
};

const initialState: any = {
  itemState: {},
};

class Tree extends React.Component<TreeProps, typeof initialState> {
  state = initialState;

  static defaultProps: Partial<TreeProps> = {
    collapsed: false,
    level: 0,
    parentPath: [],
  };

  onClick = (key: string) => () => {
    if (this.props.tree[key] === null) {
      this.props.onSelectItem(this.getPath(key));
    } else {
      this.setState({
        itemState: {
          ...this.state.itemState,
          [key]: !this.state.itemState[key],
        },
      });
    }
  }

  getPath = (key: string) => [...this.props.parentPath, key];
  isSamePath = (path1: string[], path2: string[]) => _.isEqual(path1, path2);

  getSelectedPathClass = (key: string) =>
    this.isSamePath(this.props.openedPath, this.getPath(key)) ? 'selected' : ''

  getCollapsedClass = (key: string) =>
    this.state.itemState[key] ? 'collapsed' : ''

  renderItem = (key: string): React.ReactElement<any> => (
    <li
      key={key}
      className={`item ${this.getCollapsedClass(key)} ${this.getSelectedPathClass(key)}`}
    >
      <span
        className="item-label"
        onClick={this.onClick(key)}
      >
        {this.props.tree[key] &&
          <i
            className={'icon fa fa-chevron-right'}
          />
        }
        {key}
      </span>

      {this.props.tree[key] &&
        (<Tree
          tree={this.props.tree[key]}
          collapsed={this.state.itemState[key]}
          level={this.props.level + 1}
          parentPath={this.getPath(key)}
          onSelectItem={this.props.onSelectItem}
          openedPath={this.props.openedPath}
        />)}
    </li>
  )

  render() {
    return (
      <TreeRoot collapsed={this.props.collapsed} level={this.props.level}>
        {Object.keys(this.props.tree).sort().map(this.renderItem)}
      </TreeRoot>
    );
  }
}

export default Tree;


const animDuration = .2;

const TreeRoot = styled('ul')((props: any) => css`
  overflow: hidden;
  height: ${props.collapsed ? 0 : 'auto'};
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  user-select: none;

  .item {
    display: flex;
    flex: 1;
    flex-direction: column;

    &.selected {
      > .item-label, > .item-label:hover {
        background-color: ${lightBlack.toString()};
      }
    }

    > .item-label {
      display: flex;
      flex: 1;
      cursor: pointer;
      padding: 4px 4px 4px ${props.level * 16 + 16}px;
      align-items: center;

      &:hover {
        background-color: ${lightBlack.darken(.1).toString()}
      }

      .icon {
        font-size: 12px;
        margin-right: 4px;
        transition: transform ${animDuration}s;
        transform: rotate(90deg);
      }
    }

    > ul {
      height: auto;
      max-height: 1000px;
      transition: max-height ${animDuration}s;
    }

    &.collapsed {
      > .item-label {
        > .icon {
          transform: rotate(0deg);
        }
      }

      > ul {
        max-height: 0;
      }
    }
  }
`);
