import * as yaml from 'js-yaml';

export const fileExtensions = ['.yaml', '.yml'];

export const parse = (content: string): Promise<any> => {
  try {
    const data = yaml.load(content);
    return data || {};
  } catch (e) {
    return null;
  }
};

export const serialize = async (data: object): Promise<string> => {
  try {
    return yaml.safeDump(data);
  } catch (e) {
    return null;
  }
};
