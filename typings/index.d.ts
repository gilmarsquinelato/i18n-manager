import Immutable from 'immutable';

export type RecordList<RecordType> = Immutable.List<Immutable.Record<RecordType>>;

export interface ISettings {
  window: {
    width: number,
    height: number,
  };
  customSettings: ICustomSettings;
  recentFolders: string[];
}

export interface ICustomSettings {
  googleTranslateApiKey: string;
}

export interface ILoadedPath {
  type: 'file' | 'folder';
  name: string;
}

export interface ILoadedGroup extends ILoadedPath {
  type: 'file';
  items: IParsedFile[];
}

export interface ILoadedFolder extends ILoadedPath {
  type: 'folder';
  items: ILoadedPath[];
}

export interface IParsedFile {
  fileName: string;
  prefix: string;
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
  itemId?: string;
}

export interface IFormattedFolderPath {
  fullPath: string;
  folder: string;
  path: string;
}
