const feature = 'folder';

export const getFolder = (state: any) => state.getIn([feature, 'folder']);
export const isSaveRequested = (state: any) => state.getIn([feature, 'isSaveRequested']);
export const isAddingTreeItem = (state: any) => state.getIn([feature, 'isAddingTreeItem']);
export const isAddingTreeItemNode = (state: any) => state.getIn([feature, 'isAddingTreeItemNode']);
export const isRemovingTreeItem = (state: any) => state.getIn([feature, 'isRemovingTreeItem']);
export const getCurrentItemPath = (state: any) => state.getIn([feature, 'currentItemPath']);
