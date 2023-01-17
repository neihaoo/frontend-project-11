/* eslint-disable no-param-reassign  */

import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';
import { differenceWith, uniqueId } from 'lodash';

import render from './view.js';
import parse from './parser.js';
import validate from './validator.js';
import resources from '../locales/index.js';

const UPDATE_TIME = 5000;

const elements = {
  modal: document.querySelector('#modal'),
  form: document.querySelector('.rss-form'),
  feedback: document.querySelector('.feedback'),
  urlField: document.getElementById('url-input'),
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
  submitButton: document.querySelector('button[type="submit"]'),
};

const proxy = (url) => {
  const proxyURL = new URL('/get', 'https://allorigins.hexlet.app');

  proxyURL.searchParams.set('url', url);
  proxyURL.searchParams.set('disableCache', 'true');
  proxyURL.toString();

  return proxyURL;
};

const updateFeeds = (state) => {
  const promise = state.feeds.map(({ url, id }) => axios.get(proxy(url)).then((response) => {
    const currentPosts = state.posts.filter(({ feedId }) => feedId === id);
    const loadedPosts = parse(response.data.contents).posts.map((post) => ({
      ...post,
      feedId: id,
    }));
    const newPosts = differenceWith(
      loadedPosts,
      currentPosts,
      (loadedPost, currentPost) => loadedPost.title === currentPost.title,
    ).map((post) => ({ ...post, id: uniqueId() }));

    state.posts.unshift(...newPosts);
  }));

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

export default () => {
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
      const state = onChange(initialState, render(elements, initialState, i18nextInstance));

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();

        const url = new FormData(event.target).get('url');

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
            const feed = {
              id: uniqueId(), url, title, description,
            };
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
