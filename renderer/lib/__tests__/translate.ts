import { baseUrl, translate } from '../translate';


const apiKey = 'myKey';
const language = 'en';
const text = 'text';
const target = 'pt-BR';

describe('lib/translate', () => {
  it('calling the translate api with correct parameters', async () => {
    const fetcherFn = jest.fn();

    await translate(fetcherFn)(apiKey, language, text, target);

    expect(fetcherFn).toBeCalledWith(`${baseUrl}?key=${apiKey}`, {
      target,
      source: language,
      q: text,
    });
  });

  it('returning with the translated field', async () => {
    const translatedText = 'translated';
    const mockResult = { data: { data: { translations: [{ translatedText }] } } };
    const fetcherFn = jest.fn().mockResolvedValue(mockResult);

    const result = await translate(fetcherFn)(apiKey, language, text, target);

    expect(result).toEqual({ data: translatedText });
  });

  it('returning empty translation when nothing returned from api', async () => {
    const mockResult: any = { data: { data: null } };
    const fetcherFn = jest.fn().mockResolvedValue(mockResult);

    const result = await translate(fetcherFn)(apiKey, language, text, target);

    expect(result).toEqual({ data: '' });
  });

  it('returning error when throwed some error during api call', async () => {
    const mockResult: any = 'Network Error';
    const fetcherFn = jest.fn().mockRejectedValue(mockResult);

    const result = await translate(fetcherFn)(apiKey, language, text, target);

    expect(result).toEqual({ error: mockResult });
  });
});
