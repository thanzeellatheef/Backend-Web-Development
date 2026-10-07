const store = require('../data/postStore');

const DEFAULT_LIMIT = 2;
const MAX_LIMIT = 5;

function listPosts(query = {}) {
  const requestedLimit = Number.parseInt(query.limit, 10);
  const requestedPage = Number.parseInt(query.page, 10);

  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const posts = store.getAllPosts();
  const total = posts.length;
  const totalPages = Math.ceil(total / limit);

  const start = (page - 1) * limit;
  const data = posts.slice(start, start + limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

function getPost(id) {
  return store.getPostById(id);
}

function createPost(body = {}) {
  return store.createPost({
    title: body.title,
    author: body.author
  });
}

function likePost(id) {
  const post = store.incrementLikes(id);

  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    err.code = 'POST_NOT_FOUND';
    throw err;
  }

  return post;
}

function explode() {
  const err = new Error('Internal failure');
  err.statusCode = 500;
  throw err;
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
