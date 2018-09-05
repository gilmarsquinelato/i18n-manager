import * as React from 'react';
import Immutable from 'immutable';
import { css } from 'emotion';
import styled from 'react-emotion';
import _ from 'lodash';
import axios from 'axios';

import { lightBlack, darkBlack } from '~/lib/palette';
import buildTree from './treeBuilder';

import Tree from '../../components/Tree';
import Content from '../../components/Content';
import { hot } from 'react-hot-loader';


const translate = async (apiKey: string, language: string, text: string, target: string) => {
  try {
    const { data } = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        target,
        source: language,
        q: text,
      },
    );

    return {
      data: _.get(data, 'data.translations[0].translatedText', ''),
    };
  } catch (error) {
    return {
      error,
    };
  }
};


const minTreeWidth = 300;
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
  googleTranslateAPIKey: string;
}

interface IState {
  folder: Immutable.List<any>;
  openedPath: string[];
  isDragging: boolean;
  treeWidth: number;
  tree: any;
  translateErrors: string[];
  isTranslating: boolean;
}

class Folder extends React.Component<IProps, IState> {
  state: IState = {
    folder: null,
    openedPath: [],
    isDragging: false,
    treeWidth: minTreeWidth,
    tree: Immutable.fromJS({}),
    translateErrors: [],
    isTranslating: false,
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

  /**
   * Called when an input in the Content was clicked with the right mouse buttom
   */
  onContentMouseUp = (e: any) => {
    if (e.button === 2) {
      this.showContextMenu(e.pageX, e.pageY, {
        isFromTree: false,
        enableCut: true,
        enableCopy: true,
        enablePaste: true,
      });
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


  isNode = (path: string[]) => typeof this.state.tree.getIn(path) !== 'object';

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
        compareCallback(acc, curr, this.props.folder.get(key)),
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
          getValueOrToJS(state.get('data').getIn(path)),
          getValueOrToJS(props.get('data').getIn(path)),
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
          getValueOrToJS(state.get('data').getIn(path)) !== undefined &&
          getValueOrToJS(props.get('data').getIn(path)) === undefined
        ),
    )

  /**
   * Check if the given path is missing in the given language
   */
  isMissingPathFromLanguage = (path: string[] = [], language: string) =>
    !this.getPathFromFolder(this.state.folder, path, language)

  /**
   * Check if the given path is missing in some language
   */
  isMissingPath = (path: string[]) =>
    this.state.folder &&
    this.state.folder.reduce(
      (acc: boolean, curr: any) =>
        acc ||
        !curr.get('data').getIn(path),
      false,
    )

  /**
   * Get the value based on a given path and language from a folder (from state or props)
   */
  getPathFromFolder = (folder: any, path: string[], language: string) => {
    if (!folder) {
      return;
    }

    const lanaguageItem = folder.find((i: any) => i.get('language') === language);
    if (!lanaguageItem) {
      return;
    }

    return lanaguageItem.get('data').getIn(path);
  }

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

  isTranslationEnabled = () =>
    this.props.googleTranslateAPIKey &&
    this.props.googleTranslateAPIKey.length > 0

  translateEmptyFields = async (language: string, text: string, path: string[]) => {
    this.setState({
      translateErrors: [],
      isTranslating: true,
    });

    const translateErrors = [];

    let folder = this.state.folder;
    for (let i = 0; i < folder.size; ++i) {
      let folderItem = folder.get(i);
      const currentLanguage = folderItem.get('language');
      const currentPathItem = folderItem.getIn(['data', ...path]);

      if (currentLanguage === language ||
        (currentPathItem && currentPathItem.length > 0)) {
        continue;
      }

      const result = await translate(
        this.props.googleTranslateAPIKey,
        language,
        text,
        currentLanguage,
      );

      if (result.error) {
        translateErrors.push(result.error.message);
      } else {
        folderItem = folderItem.setIn(['data', ...path], result.data);
        folder = folder.set(i, folderItem);
      }
    }

    this.setState({
      folder,
      translateErrors: _.uniq(translateErrors),
      isTranslating: false,
    });
    this.sendIsChanged();
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

      {this.props.isAddingTreeItem && <TreeOverlay onClick={this.onCancelAddNewItem} />}
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
            onMouseUp={this.onContentMouseUp}
            isChangedValue={this.isChangedValue}
            isMissingPath={this.isMissingPathFromLanguage}
            isNewPath={this.isNewPath(this.state.openedPath)}
            isTranslationEnabled={this.isTranslationEnabled}
            translateEmptyFields={this.translateEmptyFields}
            isTranslating={this.state.isTranslating}
            translateErrors={this.state.translateErrors}
          />
        </ResizeablePanel>

        <StatusBar>
          <StatusBarItem className="save" hidden={!this.props.isSaveRequested}>
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
  padding-bottom: 32px;
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

const StatusBar = styled('div')`
  display: flex;
  height: 24px;
  font-size: 14px;
  padding: 0 8px;
`;

const StatusBarItem = styled('span')((props: any) => css`
  transition: opacity 1s;
  opacity: ${props.hidden ? 0 : 1};

  .icon {
    margin-right: 4px;
  }
`);
