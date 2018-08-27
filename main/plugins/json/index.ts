import * as fs from 'fs';
import * as util from 'util';

export const fileExtension = '.json';

export const parse = async (path: string): Promise<any> => {
  try {
    const content = await util.promisify(fs.readFile)(path);
    return JSON.parse(content.toString());
  } catch (e) {
    return null;
  }
};

export const save = (path: string, data: object): boolean => {
  return true;
};
