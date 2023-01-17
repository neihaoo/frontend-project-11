import { string, setLocale } from 'yup';

setLocale({
  string: {
    url: 'notURL',
  },
  mixed: {
    required: 'required',
    notOneOf: 'exists',
  },
});

const validate = (currentURL, feeds) => {
  const previousURLs = feeds.map(({ url }) => url);

  return string().url().required().notOneOf(previousURLs).validate(currentURL);
};

export default validate;
