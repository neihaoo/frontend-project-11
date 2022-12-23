/* eslint-disable no-param-reassign  */

const render = (elements, state, i18nextInstance) => (path, value) => {
  if (path === 'form.valid' && value) {
    elements.urlField.classList.toggle('is-invalid');

    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    elements.feedback.textContent = i18nextInstance.t('get_success');
  }
  if (path === 'form.valid' && !value) {
    elements.urlField.classList.toggle('is-invalid');

    elements.feedback.classList.add('text-danger');
    elements.feedback.classList.remove('text-success');
    elements.feedback.textContent = state.form.error;
  }
};

export default render;
