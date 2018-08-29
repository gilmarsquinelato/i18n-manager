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

export const save = async (path: string, data: object): Promise<boolean> => {
  try {
    await util.promisify(fs.writeFile)(path, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    return false;
  }
};
