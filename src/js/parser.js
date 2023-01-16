const parse = (string) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(string, 'text/xml');

  const error = !!content.querySelector('parsererror');

  if (error) {
    throw new Error('parserError');
  }

  const title = content.querySelector('title').textContent;
  const description = content.querySelector('description').textContent;

  const posts = [...content.querySelectorAll('item')].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postLink = post.querySelector('link').textContent;

    return { title: postTitle, description: postDescription, link: postLink };
  });

  return { title, description, posts };
};

export default parse;
