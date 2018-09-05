import Immutable from 'immutable';
import _ from 'lodash';


const buildTree = (folder: Immutable.List<any>): any => {
  if (!folder || folder.size === 0) {
    return Immutable.List();
  }

  const contents = folder.map(i => i.get('data'));
  const merged = contents.reduce((acc, curr) => acc.mergeDeep(curr), Immutable.fromJS({}));

  return merged;
};

export default buildTree;
