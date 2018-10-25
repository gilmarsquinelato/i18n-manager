export interface ParsedFile {
  fileName: string;
  language: string;
  extension: string;
  filePath: string;
  data: any;
}

export interface IContextMenuOptions {
  enableCut: boolean;
  enableCopy: boolean;
  enablePaste: boolean;
  x: number;
  y: number;
  isFromTree: boolean;
  isNode: boolean;
  path?: string[];
}

export interface IMenuOptions {
}

export interface IFormattedFolderPath {
  fullPath: string;
  folder: string;
  path: string;
}
