/* eslint-disable no-param-reassign  */

const render = (elements, state) => (path, value) => {
  if (path === 'form.valid' && value) {
    elements.urlField.classList.toggle('is-invalid');

    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    elements.feedback.textContent = 'RSS успешно загружен';
  }
  if (path === 'form.valid' && !value) {
    elements.urlField.classList.toggle('is-invalid');

    elements.feedback.classList.add('text-danger');
    elements.feedback.classList.remove('text-success');
    elements.feedback.textContent = state.form.error;
  }
};

export default render;
