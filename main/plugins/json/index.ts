export const fileExtensions = ['.json', '.arb'];

export const parse = (content: string): Promise<any> => {
  try {
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
};

export const serialize = async (data: object): Promise<string> => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return '{}';
  }
};
