import Immutable from 'immutable';
import _ from 'lodash';


const getTreePaths = (contents: Immutable.Iterable<number, any>): Immutable.Iterable<number, any> =>
  contents
    .filter((_value: any, key: any) => key.length > 0)
    .map((value: any, key: any) => _.isObject(value) ? getTreePaths(contents.get(key)) : null);

const buildTree = (folder: Immutable.List<any>): any => {
  if (!folder || folder.size === 0) {
    return [];
  }

  let tree = {};
  const contents = folder.map(i => i.get('data'));
  for (let i = 0; i < contents.size; ++i) {
    tree = _.merge(tree, getTreePaths(contents.get(i)).toJS());
  }

  return tree;
};

export default buildTree;
