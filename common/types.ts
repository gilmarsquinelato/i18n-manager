export interface Settings {
  window: {
    width: number;
    height: number;
  };
  customSettings: CustomSettings;
  recentFolders: string[];
}

export interface CustomSettings {
  googleTranslateApiKey: string;
}

export interface LoadedPath {
  type: 'file' | 'folder';
  name: string;
}

export interface LoadedGroup extends LoadedPath {
  type: 'file';
  items: ParsedFile[];
}

export interface LoadedFolder extends LoadedPath {
  type: 'folder';
  items: LoadedPath[];
}

export interface ParsedFile {
  fileName: string;
  prefix: string;
  language: string;
  extension: string;
  filePath: string;
  data: any;
}

export interface ContextMenuOptions {
  enableCut: boolean;
  enableCopy: boolean;
  enablePaste: boolean;
  x: number;
  y: number;
  isFromTree: boolean;
  isNode: boolean;
  itemId?: string;
}

export interface FormattedFolderPath {
  fullPath: string;
  folder: string;
  path: string;
}
