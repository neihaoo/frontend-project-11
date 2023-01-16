/* eslint-disable no-param-reassign  */

const renderError = (elements, message) => {
  elements.feedback.classList.add('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.textContent = message;
};

const renderSuccess = (elements, message) => {
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = message;
};

const createHTMLElement = (title, content) => `
  <div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">${title}</h2>
    </div>
    <ul class="list-group border-0 rounded-0">${content}</ul>
  </div>
`;

const renderFeeds = (container, feeds, i18next) => {
  const feedsList = feeds.map(
    ({ title, description }) => `
    <li class="list-group-item border-0 border-end-0">
      <h3 class="h6 m-0">${title}</h3>
      <p class="m-0 small text-black-50">${description}</p>
    </li>
  `
  );

  container.innerHTML = createHTMLElement(i18next.t('feedsTitle'), feedsList.join(''));
};

const renderPosts = (container, posts, i18next) => {
  const postsList = posts.map(
    ({ title, link }) => `
    <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
      <a href="${link}" class="fw-bold" data-id="2" target="_blank" rel="noopener noreferrer">${title}</a>
      <button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
    </li>
  `
  );

  container.innerHTML = createHTMLElement(i18next.t('postsTitle'), postsList.join(''));
};

const handleProcessState = (elements, processState, state, i18next) => {
  switch (processState) {
    case 'getting':
      elements.submitButton.disabled = true;
      elements.urlField.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.textContent = '';
      break;

    case 'get':
      elements.submitButton.disabled = false;

      renderFeeds(elements.feeds, state.feeds, i18next);
      renderPosts(elements.posts, state.posts, i18next);
      renderSuccess(elements, i18next.t('success'));
      break;

    case 'error':
      elements.submitButton.disabled = false;
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const render = (elements, state, i18next) => (path, value) => {
  switch (path) {
    case 'status':
      handleProcessState(elements, value, state, i18next);
      break;

    case 'error':
      if (state.form.status === 'invalid') {
        elements.urlField.classList.add('is-invalid');
      }

      renderError(elements, value);
      break;

    default:
      break;
  }
};

export default render;
