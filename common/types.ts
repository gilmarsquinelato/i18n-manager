export type ParsedFile = {
  fileName: string,
  language: string,
  filePath: string,
  data: any,
};

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
