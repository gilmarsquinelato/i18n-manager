module.exports = {
  // Couldn't get these properties from original module
  // Jest reporting error in getPath from undefined
  REDUX_DEVTOOLS: {
    id: 'lmhkpmbekcpmknklioeibfkpmmfibljd',
    electron: '>=1.2.1',
  },
  REACT_DEVELOPER_TOOLS: {
    id: 'fmkadmapgofadopljbjfkapdkoienihi',
    electron: '>=1.2.1',
  },
  default: jest.fn().mockResolvedValue(true),
};
