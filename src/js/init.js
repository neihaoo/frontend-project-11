import onChange from 'on-change';
import * as yup from 'yup';
import render from './view.js';

const schema = yup.object().shape({
  url: yup.string().url().required(),
});

const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });

    return '';
  } catch (e) {
    return 'Ссылка должна быть валидным URL';
  }
};

export default () => {
  const elements = {
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    urlField: document.getElementById('url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
  };

  const initialState = {
    form: {
      valid: null,
      error: null,
    },
  };

  const state = onChange(initialState, render(elements, initialState));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(elements.form);

    const url = formData.get('url');
    const error = validate({ url });

    state.form.error = error;
    state.form.valid = error.length === 0;
  });
};
