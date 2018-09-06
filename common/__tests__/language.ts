import { getLocaleFromText } from '../language';

describe('language', () => {
  it('getLocaleFromText', () => {
    const result = getLocaleFromText('messages_en_us');
    expect(result).toBe('en-US');
  });
});
