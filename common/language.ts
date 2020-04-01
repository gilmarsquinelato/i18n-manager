import _ from 'lodash/fp';
import locales from './locales';

const localesKeys = Object.keys(locales);

export const getLocale = _.memoize((locale: string): string | undefined =>
  localesKeys.find(it => it.toLowerCase() === locale.toLowerCase().replace('_', '-')),
);

export const getLocaleFromText = _.memoize((text: string): string => {
  const normalizedText = getNormalizedText(text);

  const filteredLocales = localesKeys.filter(l => normalizedText === l.toLowerCase());

  // the best locale match is the key with most letters matched with given text
  return _.maxBy(l => l.length, filteredLocales) || text;
});

export const getLocaleLabel = (locale: string): string =>
  locales[localesKeys.find(it => it.toLowerCase() === locale.toLowerCase()) || ''];

const getNormalizedText = (text: string): string => {
  if (text.length === 2) {
    return text;
  }

  const normalizedText = text
    .replace(/_/g, '-')
    .toLowerCase()
    .split('-');
  if (normalizedText.length === 1) {
    return text;
  }

  if (normalizedText[0].length > 2) {
    normalizedText.shift();
  }

  return normalizedText.join('-');
};
