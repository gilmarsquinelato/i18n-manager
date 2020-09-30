export const fileExtensions = ['.js'];

export const parse = (content: string): Promise<any> => {
  try {
    content = content.replace(`${getModuleExport(content)} `, '');
    // replace { msg: "hello" } with { "msg": "hello" }
    content = content.replace(new RegExp("(\\\"(.*?)\\\"|(\\w+))(\\s*:\\s*(\\\".*?\\\"|.))"), "\"$2$3\"$4");
    return JSON.parse(content);
  } catch (e) {
    return Promise.resolve(undefined);
  }
};

export const serialize = async (data: object, oldFileContent: string): Promise<string | undefined> => {
  try {
    return `${getModuleExport(oldFileContent)} ${JSON.stringify(data, null, 2)}`;
  } catch (e) {
    return undefined;
  }
};

const getModuleExport = (content: string) => {
  return content.startsWith("export default") ? "export default" : "module.exports =";
};