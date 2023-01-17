const renderFormState = (elements, state, i18next) => {
  const { urlField, feedback } = elements;
  const { valid, error } = state;

  if (valid) {
    urlField.classList.remove('is-invalid');
  } else {
    feedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown']);

    urlField.classList.add('is-invalid');
    feedback.classList.add('text-danger');
  }
};

const handleProcessState = (elements, state, i18next) => {
  const { submitButton, urlField, feedback } = elements;
  const { loadingProcess } = state;

  switch (loadingProcess.status) {
    case 'idle':
      submitButton.disabled = false;
      urlField.value = '';
      feedback.textContent = i18next.t('loading.success');

      urlField.focus();
      urlField.removeAttribute('readonly');
      feedback.classList.add('text-success');

      break;

    case 'loading':
      submitButton.disabled = true;
      feedback.innerHTML = '';

      urlField.setAttribute('readonly', true);
      feedback.classList.remove('text-success');
      feedback.classList.remove('text-danger');

      break;

    case 'failed':
      submitButton.disabled = false;
      feedback.textContent = i18next.t([`errors.${loadingProcess.error}`, 'errors.unknown']);

      urlField.removeAttribute('readonly');
      feedback.classList.add('text-danger');

      break;

    default:
      throw new Error(`Unknown loadingProcess status: '${loadingProcess.status}'`);
  }
};

const renderFeeds = (elements, state, i18next) => {
  const { feeds } = state;
  const { feedsContainer } = elements;
  const div = document.createElement('div');
  const h2 = document.createElement('h2');
  const ul = document.createElement('ul');

  div.innerHTML = "<div class='card-body'></div>";
  h2.textContent = i18next.t('feeds');

  div.classList.add('card', 'border-0');
  h2.classList.add('card-title', 'h4');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  div.querySelector('.card-body').appendChild(h2);

  const list = feeds.map(({ title, description }) => {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');

    h3.textContent = title;
    p.textContent = description;

    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    h3.classList.add('h6', 'm-0');
    p.classList.add('m-0', 'small', 'text-black-50');

    li.append(h3, p);

    return li;
  });

  feedsContainer.innerHTML = '';

  ul.append(...list);
  div.appendChild(ul);
  feedsContainer.appendChild(div);
};

const renderPosts = (elements, state, i18next) => {
  const { posts, ui } = state;
  const { postsContainer } = elements;
  const div = document.createElement('div');
  const h2 = document.createElement('h2');
  const ul = document.createElement('ul');

  div.innerHTML = "<div class='card-body'></div>";
  h2.textContent = i18next.t('posts');

  div.classList.add('card', 'border-0');
  h2.classList.add('card-title', 'h4');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  div.querySelector('.card-body').appendChild(h2);

  const list = posts.map((post) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const button = document.createElement('button');
    const seenPosts = ui.seenPosts.has(post.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];

    a.dataset.id = post.id;
    a.textContent = post.title;
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18next.t('preview');

    a.setAttribute('href', post.link);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    button.setAttribute('type', 'button');
    a.classList.add(...seenPosts);
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0'
    );

    li.append(a, button);

    return li;
  });

  postsContainer.innerHTML = '';

  ul.append(...list);
  div.appendChild(ul);
  postsContainer.appendChild(div);
};

const renderModal = (elements, state) => {
  const post = state.posts.find(({ id }) => id === state.modal.postId);
  const title = elements.modal.querySelector('.modal-title');
  const description = elements.modal.querySelector('.modal-body');
  const link = elements.modal.querySelector('.full-article');

  title.textContent = post.title;
  description.textContent = post.description;
  link.href = post.link;
};

const render = (elements, state, i18next) => (path, value) => {
  switch (path) {
    case 'form':
      renderFormState(elements, value, i18next);
      break;

    case 'loadingProcess.status':
      handleProcessState(elements, state, i18next);
      break;

    case 'feeds':
      renderFeeds(elements, state, i18next);
      break;

    case 'posts':
    case 'ui.seenPosts':
      renderPosts(elements, state, i18next);
      break;

    case 'modal.postId':
      renderModal(elements, state);
      break;

    default:
      break;
  }
};

export default render;
