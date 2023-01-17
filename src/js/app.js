/* eslint-disable no-param-reassign  */

import { string, setLocale } from 'yup';
import { xorWith, uniqueId } from 'lodash';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import render from './view.js';
import resources from '../locales/index.js';
import parse from './parser.js';

const UPDATE_TIME = 5000;

const elements = {
  feedback: document.querySelector('.feedback'),
  form: document.querySelector('.rss-form'),
  urlField: document.getElementById('url-input'),
  submitButton: document.querySelector('button[type="submit"]'),
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
  modal: document.querySelector('#modal'),
};

const proxy = (url) => {
  const proxyURL = new URL('/get', 'https://allorigins.hexlet.app');

  proxyURL.searchParams.set('url', url);
  proxyURL.searchParams.set('disableCache', 'true');
  proxyURL.toString();

  return proxyURL;
};

const updateFeeds = (state) => {
  const promise = state.feeds.map(({ url, id }) =>
    axios.get(proxy(url)).then((response) => {
      const loadedPosts = parse(response.data.contents).posts.map((post) => ({
        ...post,
        feedId: id,
      }));
      const currentPosts = state.posts.filter(({ feedId }) => feedId === id);
      const newPosts = xorWith(
        loadedPosts,
        currentPosts,
        (loadedPost, currentPost) => loadedPost.title === currentPost.title
      ).map((post) => ({ ...post, id: uniqueId() }));

      state.posts.unshift(...newPosts);
    })
  );

  Promise.all(promise).finally(() => {
    setTimeout(() => updateFeeds(state), UPDATE_TIME);
  });
};

const handleErrorState = (error, state) => {
  switch (error.name) {
    case 'ValidationError':
      state.form = { ...state.form, valid: false, error: error.message };

      break;

    case 'parserError':
      state.loadingProcess.error = 'noRSS';
      state.loadingProcess.status = 'failed';

      break;

    case 'AxiosError':
      state.loadingProcess.error = 'network';
      state.loadingProcess.status = 'failed';

      break;

    default:
      state.loadingProcess.error = 'unknown';
      state.loadingProcess.status = 'failed';

      break;
  }
};

const app = () => {
  const initialState = {
    feeds: [],
    posts: [],
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    form: {
      error: null,
      valid: false,
    },
    modal: {
      postId: null,
    },
    ui: {
      seenPosts: new Set(),
    },
  };

  const i18nextInstance = i18next.createInstance();

  i18nextInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => {
      setLocale({
        string: {
          url: 'notURL',
        },
        mixed: {
          required: 'required',
          notOneOf: 'exists',
        },
      });

      const state = onChange(initialState, render(elements, initialState, i18nextInstance));

      const validate = (currentURL, feeds) => {
        const previousURLs = feeds.map(({ url }) => url);

        return string().url().required().notOneOf(previousURLs).validate(currentURL);
      };

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const url = formData.get('url');

        validate(url, state.feeds)
          .then(() => {
            state.form = { ...state.form, valid: true, error: null };
          })
          .then(() => {
            state.loadingProcess.status = 'loading';

            return axios.get(proxy(url));
          })
          .then((response) => {
            const { title, description, posts } = parse(response.data.contents);
            const feed = { id: uniqueId(), url, title, description };
            const postsList = posts.map((post) => ({ ...post, id: uniqueId(), feedId: feed.id }));

            state.feeds.unshift(feed);
            state.posts.unshift(...postsList);

            state.loadingProcess.error = null;
            state.loadingProcess.status = 'idle';
          })
          .catch((error) => {
            handleErrorState(error, state);
          });
      });

      elements.postsContainer.addEventListener('click', ({ target }) => {
        if (!('id' in target.dataset)) {
          return;
        }

        const { id } = target.dataset;

        state.modal.postId = id;

        state.ui.seenPosts.add(id);
      });

      setTimeout(() => updateFeeds(state), UPDATE_TIME);
    });
};

export default app;
