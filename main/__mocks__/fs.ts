const path = require('path');

const fs = jest.genMockFromModule('fs');

let mockFiles: any = {};
let mockFolders: any = {};
// tslint:disable-next-line:function-name
function __setMockFiles(newMockFiles: any) {
  mockFiles = {};
  mockFolders = {};

  for (const file in newMockFiles) {
    addFile(file, newMockFiles[file]);
  }
}

const addFile = (file: string, data: any) => {
  mockFiles[file] = data;
  const dir = path.dirname(file);

  if (!mockFolders[dir]) {
    mockFolders[dir] = [];
  }
  mockFolders[dir].push(path.basename(file));
};


const readdir =
  (directoryPath: string, callback: (err: NodeJS.ErrnoException, files: string[]) => void) =>
    callback(null, mockFolders[directoryPath] || []);

const writeFile = (
  filePath: string, content: string,
  callback: (err: NodeJS.ErrnoException, success: boolean) => void) => {
  addFile(filePath, content);
  callback(null, true);
};

const readFile = jest.fn((
  filePath: string,
  callback: (err: NodeJS.ErrnoException, data: any) => void) => {
  callback(null, Buffer.from(mockFiles[filePath], 'utf-8'));
});

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
(fs as any).readFile = readFile;
(fs as any).existsSync = (path: string) => mockFiles[path] !== undefined;
(fs as any).readFileSync = (path: string) => Buffer.from(mockFiles[path], 'utf-8');

module.exports = fs;
