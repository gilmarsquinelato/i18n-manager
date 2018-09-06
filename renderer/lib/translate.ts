import axios from 'axios';
import _ from 'lodash';


export const baseUrl = 'https://translation.googleapis.com/language/translate/v2';

export const translate = (fetcher: Function) =>
  async (apiKey: string, language: string, text: string, target: string) => {
    try {
      const { data } = await fetcher(
        `${baseUrl}?key=${apiKey}`,
        {
          target,
          source: language,
          q: text,
        },
      );

      return {
        data: _.get(data, 'data.translations[0].translatedText', ''),
      };
    } catch (error) {
      return {
        error,
      };
    }
  };

export default translate(axios.post);
