import { string, setLocale } from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import render from './view.js';
import resources from '../locales/index.js';

const urlSchema = string().url().required();

const validate = (field, i18nextInstance) => {
  setLocale({
    string: {
      url: 'url_invalid',
    },
  });

  try {
    urlSchema.validateSync(field, { abortEarly: false });

    return '';
  } catch (err) {
    return i18nextInstance.t('url_invalid');
  }
};

export default () => {
  const initialState = {
    lng: 'ru',
    form: {
      valid: null,
      error: null,
    },
  };

  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
    lng: initialState.lng,
    resources,
  });

  const elements = {
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    urlField: document.getElementById('url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
  };

  const state = onChange(initialState, render(elements, initialState, i18nextInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(elements.form);

    const url = formData.get('url');
    const error = validate(url, i18nextInstance);

    state.form.error = error;
    state.form.valid = error.length === 0;
  });
};
