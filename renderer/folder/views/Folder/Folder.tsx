import * as React from 'react';
import Immutable from 'immutable';
import styled from 'react-emotion';
import _ from 'lodash';

import { lightBlack, darkBlack } from '~/lib/palette';
import buildTree from './treeBuilder';

import Tree from '../../components/Tree';
import Content from '../../components/Content';
import { hot } from 'react-hot-loader';


const minTreeWidth = 400;
const resizerWidth = 8;


const getValueOrToJS = (value: any) =>
  _.isObject(value) ? value.toJS() : value;

interface IProps {
  folder?: Immutable.List<any>;
  isSaveRequested: boolean;
  saveFolder: Function;
  dataChanged: Function;
  showContextMenu: Function;
  isAddingTreeItem: boolean;
  isAddingTreeItemNode: boolean;
  isRemovingTreeItem: boolean;
  currentItemPath: Immutable.List<any>;
  addTreeItemFinished: Function;
  removeTreeItemFinished: Function;
}

interface IState {
  folder: Immutable.List<any>;
  openedPath: string[];
  isDragging: boolean;
  treeWidth: number;
  tree: any;
}

class Folder extends React.Component<IProps, IState> {
  state: IState = {
    folder: null,
    openedPath: [],
    isDragging: false,
    treeWidth: minTreeWidth,
    tree: [],
  };

  mouseLeavingFn: () => void;

  static getDerivedStateFromProps = ({ folder }: IProps, prevState: IState) =>
    !prevState.folder || prevState.folder.size === 0 || folder === null ?
      {
        folder,
        tree: buildTree(folder),
      } :
      null

  componentDidMount() {
    this.mouseLeavingFn = () => this.setIsDragging(false);
    document.addEventListener('mouseleave', this.mouseLeavingFn);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseleave', this.mouseLeavingFn);
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.props.isSaveRequested && !prevProps.isSaveRequested) {
      this.props.saveFolder(this.state.folder.toJS());
    }
    console.log(this.props.isRemovingTreeItem);
    if (this.props.isRemovingTreeItem && !prevProps.isRemovingTreeItem) {
      this.removeTreeItem();
    }
  }

  onSelectItem = (path: string[]) => this.setState({ openedPath: path });

  /**
   * Called when a item in the tree was clicked with the right mouse buttom
   */
  onRightClickItemTree = (path: string[], x: number, y: number) =>
    this.showContextMenu(x, y, {
      path,
      isFromTree: true,
      isNode: this.isNode(path),
    })

  /**
   * Called when the tree was clicked with the right mouse buttom
   */
  onTreeMouseUp = (e: any) => {
    if (e.button === 2) {
      this.onRightClickItemTree([], e.pageX, e.pageY);
    }
  }

  onChange = (language: string, value: string) => {
    const folder = this.state.folder.setIn(
      [this.getLanguageIndex(language), 'data', ...this.state.openedPath],
      value,
    );

    this.setState({ folder });
    this.sendIsChanged();
  }

  updateFolderData = (dataChangeCallback: (data: any) => any): Immutable.List<any> => {
    let folder = this.state.folder;
    for (let i = 0; i < folder.size; ++i) {
      const data = dataChangeCallback(folder.get(i).get('data'));
      const folderItem = folder.get(i).set('data', data);
      folder = folder.set(i, folderItem);
    }
    return folder;
  }

  onAddNewItem = (path: string[], itemName: string) => {
    const item = this.props.isAddingTreeItemNode ? '' : {};
    const itemPath = [...path, itemName];

    const folder = this.updateFolderData(data => data.setIn(itemPath, Immutable.fromJS(item)));

    this.setState({
      folder,
      openedPath: item === '' ? itemPath : this.state.openedPath,
      tree: buildTree(folder),
    });

    this.props.addTreeItemFinished();
    this.sendIsChanged();
  }

  removeTreeItem = () => {
    const folder = this.updateFolderData(data => data.deleteIn(this.props.currentItemPath));
    console.log(folder);

    const openedPath =
      _.isEqual(this.props.currentItemPath.toJS(), this.state.openedPath) ?
        [] :
        this.state.openedPath;

    this.setState({
      folder,
      openedPath,
      tree: buildTree(folder),
    });
    this.props.removeTreeItemFinished();
    this.sendIsChanged();
  }

  onCancelAddNewItem = () => {
    this.props.addTreeItemFinished();
  }

  setIsDragging = (isDragging: boolean) => this.setState({ isDragging });

  showContextMenu = (x: number, y: number, data: any) =>
    this.props.showContextMenu({ x, y, ...data })


  isNode = (path: string[]) => _.get(this.state.tree, path) === null;

  getLanguageIndex = (language: string) =>
    this.state.folder.indexOf(
      this.state.folder.find(i => i.get('language') === language),
    )

  sendIsChanged = _.debounce(
    () => this.props.dataChanged(
      !_.isEqual(
        this.state.folder.toJS(),
        this.props.folder.toJS(),
      ),
    ),
    200,
  );


  foldersCompare = (
    initialValue: boolean,
    compareCallback: (accumulator: boolean, stateFolder: any, propsFolder: any) => boolean,
  ) =>
    this.state.folder &&
    this.props.folder &&
    this.state.folder.reduce(
      (acc: boolean, curr: any, key: number) =>
        compareCallback(acc, curr.get('data'), this.props.folder.getIn([key, 'data'])),
      initialValue,
    )

  /**
   * Check if the given path is not equal to the original path (from props folder)
   */
  isChangedPath = (path: string[]) =>
    this.foldersCompare(
      false,
      (acc, state, props) =>
        acc ||
        !_.isEqual(
          getValueOrToJS(state.getIn(path)),
          getValueOrToJS(props.getIn(path)),
        ),
    )

  /**
   * Check if the given path is missing in all languages comparing the state with the props folder
   */
  isNewPath = (path: string[]) =>
    this.foldersCompare(
      true,
      (acc, state, props) =>
        acc &&
        (
          getValueOrToJS(state.getIn(path)) !== undefined &&
          getValueOrToJS(props.getIn(path)) === undefined
        ),
    )

  /**
   * Check if the given path is missing in the given language
   */
  isMissingPathFromLanguage = (path: string[] = [], language: string) =>
    this.getPathFromFolder(this.state.folder, path, language) === undefined

  /**
   * Check if the given path is missing in some language
   */
  isMissingPath = (path: string[]) =>
    this.state.folder &&
    this.state.folder.reduce(
      (acc: boolean, curr: any) =>
        acc ||
        curr.get('data').getIn(path) === undefined,
      false,
    )

  /**
   * Get the value based on a given path and language from a folder (from state or props)
   */
  getPathFromFolder = (folder: any, path: string[], language: string) =>
    folder &&
    folder
      .find((i: any) => i.get('language') === language)
      .get('data').getIn(path)

  /**
   * Compares the state folder with the props folder
   * to determine if the opened path of the given language was changed
   */
  isChangedValue = (language: string) => {
    const path = this.state.openedPath;
    const stateItem = this.getPathFromFolder(this.state.folder, path, language);
    const propsItem = this.getPathFromFolder(this.props.folder, path, language);

    return stateItem !== propsItem;
  }

  renderTree = () => (
    <ResizeableItem
      style={{
        backgroundColor: darkBlack.toString(),
        minWidth: minTreeWidth,
        width: this.state.treeWidth,
      }}
      onMouseUp={this.onTreeMouseUp}
    >
      <Tree
        tree={this.state.tree}
        onSelectItem={this.onSelectItem}
        openedPath={this.state.openedPath}
        isChangedPath={this.isChangedPath}
        isNewPath={this.isNewPath}
        isMissingPath={this.isMissingPath}
        onRightClickItem={this.onRightClickItemTree}
        isAddingTreeItem={this.props.isAddingTreeItem}
        onAddNewItem={this.onAddNewItem}
        onCancelAddNewItem={this.onCancelAddNewItem}
        currentItemPath={
          this.props.currentItemPath ?
            this.props.currentItemPath.toJS() :
            []
        }
      />
      {this.props.isAddingTreeItem && <TreeOverlay />}
    </ResizeableItem>
  )

  render() {
    return (
      <FolderRoot>
        <ResizeablePanel
          className={this.state.isDragging ? 'dragging' : ''}
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
            isChangedValue={this.isChangedValue}
            isMissingPath={this.isMissingPathFromLanguage}
            isNewPath={this.isNewPath(this.state.openedPath)}
          />
        </ResizeablePanel>

        <StatusBar>
          <StatusBarItem className={`save ${!this.props.isSaveRequested ? 'hidden' : ''}`}>
            <i className="fas fa-spinner fa-spin icon" />
            Saving...
          </StatusBarItem>
        </StatusBar>
      </FolderRoot>
    );
  }
}

export default hot(module)(Folder);


const FolderRoot = styled('div')`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const ResizeablePanel = styled('div')`
  display: flex;
  flex-direction: row;
  flex: 1;

  &.dragging {
    cursor: col-resize;
  }

  .drag-item {
    width: ${resizerWidth}px;
    background: ${lightBlack.toString()};
    cursor: col-resize;
  }
`;

const ResizeableItem = styled('div')`
  position: relative;
  overflow: auto;
`;

const StatusBar = styled('div')`
  display: flex;
  height: 24px;
  font-size: 14px;
  padding: 0 8px;
`;

const StatusBarItem = styled('span')`
  transition: opacity 1s;

  &.hidden {
    opacity: 0;
  }

  .icon {
    margin-right: 4px;
  }
`;

const TreeOverlay = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${darkBlack.toString()};
  opacity: .5;
`;
