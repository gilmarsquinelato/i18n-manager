export const fileExtensions = ['.js'];

export const parse = (content: string): Promise<any> => {
  try {
    content = content.replace('export default ', '');
    // replace { msg: "hello" } with { "msg": "hello" }
    content = content.replace( new RegExp("(\\\"(.*?)\\\"|(\\w+))(\\s*:\\s*(\\\".*?\\\"|.))"), "\"$2$3\"$4");
    return JSON.parse(content);
  } catch (e) {
    return Promise.resolve(undefined);
  }
};

export const serialize = async (data: object): Promise<string | undefined> => {
  try {
    return `export default ${JSON.stringify(data, null, 2)}`;
  } catch (e) {
    return undefined;
  }
};
