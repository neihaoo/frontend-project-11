import { string, setLocale } from 'yup';
import { uniqueId } from 'lodash';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import render from './view.js';
import resources from '../locales/index.js';
import parse from './parser.js';

const proxy = (url) => `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`;

export default () => {
  const initialState = {
    lng: 'ru',
    status: null,
    error: null,
    form: {
      status: null,
    },
    posts: [],
    feeds: [],
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
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const validate = (field) => {
    setLocale({
      string: {
        url: 'invalidURL',
      },
    });

    return string().url().required().validate(field, { abortEarly: false });
  };

  const state = onChange(initialState, render(elements, initialState, i18nextInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(elements.form);
    const url = formData.get('url');

    validate(url)
      .then(() => {
        state.form.status = 'valid';
        state.status = 'getting';

        return axios.get(proxy(url));
      })
      .then((response) => {
        const { title, description, posts } = parse(response.data.contents);
        const feedId = uniqueId();
        const postsList = posts.map((post) => ({
          id: uniqueId(),
          feedId,
          title: post.title,
          description: post.description,
          link: post.link,
        }));

        state.feeds.push(...[{ id: feedId, title, description }]);
        state.posts.push(...postsList);

        state.status = 'get';
      })
      .catch((error) => {
        if (error.name === 'ValidationError') {
          state.form.status = 'invalid';
        }

        state.status = 'error';
        state.error = i18nextInstance.t(`errors.${error.message}`, error);
      });
  });
};
