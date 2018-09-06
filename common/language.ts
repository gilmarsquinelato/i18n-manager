import _ from 'lodash';
import locales from './locales';


const localesKeys = Object.keys(locales);

export const getLocaleFromText = _.memoize((text: string): string => {
  const normalizedText = text.replace(/_/g, '-').toLowerCase();

  const filteredLocales = localesKeys.filter(l =>
    normalizedText.indexOf(l.toLowerCase()) !== -1,
  );
  // the best locale match is the key with most letters matched with given text
  const bestMatch = _.maxBy(filteredLocales, l => l.length);

  return bestMatch;
});

export const getLocaleLabel = (locale: string): string =>
  locales[locale];
