import * as json from '../json';

const fileContent = JSON.stringify({ language: 'en' }, null, 2);


describe('plugins/json', () => {
  it('parsing file', async () => {
    const data = await json.parse(fileContent);
    expect(data).toBeDefined();
    expect(data.language).toBe('en');
  });

  it('handling wrong file format', async () => {
    const data = await json.parse('{ wrong content');
    expect(data).toBeNull();
  });

  it('serializing data', async () => {
    const data = await json.parse(fileContent);
    const result = await json.serialize(data);

    expect(result).toBeTruthy();
    expect(result).toBe(fileContent);
  });
});
