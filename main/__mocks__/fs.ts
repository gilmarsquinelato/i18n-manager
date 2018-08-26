const path = require('path');

const fs = jest.genMockFromModule('fs');

let mockFiles = Object.create(null);
// tslint:disable-next-line:function-name
function __setMockFiles(newMockFiles: object) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const dir = path.dirname(file);

    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }
    mockFiles[dir].push(path.basename(file));
  }
}

const readdir =
  (directoryPath: string, callback: (err: NodeJS.ErrnoException, files: string[]) => void) =>
    callback(null, mockFiles[directoryPath] || []);

const writeFile = (
  filePath: string, content: string,
  callback: (err: NodeJS.ErrnoException, success: boolean) => void) => {
  mockFiles[filePath] = content;
  callback(null, true);
};

const lstatSync = (path: string) => ({
  isFile() {
    const splittedPath = path.split('/');
    const file = splittedPath[splittedPath.length - 1];
    return file.indexOf('.') !== -1;
  },
});

(fs as any).__setMockFiles = __setMockFiles;
(fs as any).readdir = readdir;
(fs as any).lstatSync = lstatSync;
(fs as any).writeFile = writeFile;
(fs as any).existsSync = (path: string) => mockFiles[path] !== undefined;
(fs as any).readFileSync = (path: string) => mockFiles[path];

module.exports = fs;
