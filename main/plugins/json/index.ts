export const fileExtensions = ['.json', '.arb'];

export const parse = (content: string): Promise<any> => {
  try {
    return JSON.parse(content);
  } catch (e) {
    return Promise.resolve(undefined);
  }
};

export const serialize = async (data: object): Promise<string | undefined> => {
  try {
    return JSON.stringify(data, Object.keys(data).sort(), 2);
  } catch (e) {
    return undefined;
  }
};
