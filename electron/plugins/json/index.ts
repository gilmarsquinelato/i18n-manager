import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

export const fileExtension = '.json';

export const parse = async (path: string): Promise<object> => {
  const content = await util.promisify(fs.readFile)(path);
  return JSON.parse(content.toString());
};

export const save = (path: string, data: object): boolean => {
  return true;
};