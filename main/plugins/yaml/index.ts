import * as yaml from 'js-yaml';

export const fileExtensions = ['.yaml', '.yml'];

export const parse = (content: string): Promise<any | undefined> => {
  try {
    const data = yaml.load(content);
    return data || {};
  } catch (e) {
    return Promise.resolve(undefined);
  }
};

export const serialize = async (data: object): Promise<string | undefined> => {
  try {
    return yaml.safeDump(data);
  } catch (e) {
    return undefined;
  }
};
