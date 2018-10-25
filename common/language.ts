import * as _ from 'lodash';
import locales from './locales';


const localesKeys = Object.keys(locales);

export const getLocaleFromText = _.memoize((text: string): string => {
  const normalizedText = getNormalizedText(text);

  const filteredLocales = localesKeys.filter(l =>
    normalizedText.indexOf(l.toLowerCase()) !== -1,
  );

  // the best locale match is the key with most letters matched with given text
  return _.maxBy(filteredLocales, l => l.length);
});

export const getLocaleLabel = (locale: string): string =>
  locales[localesKeys.find(it => it.toLowerCase() === locale.toLowerCase())];

const getNormalizedText = (text: string): string => {
  if (text.length === 2) {
    return text;
  }

  const normalizedText = text.replace(/_/g, '-').toLowerCase().split('-');
  if (normalizedText.length === 1) {
    return text;
  }

  if (normalizedText[0].length > 2) {
    normalizedText.shift();
  }

  return normalizedText.join('-');
};
