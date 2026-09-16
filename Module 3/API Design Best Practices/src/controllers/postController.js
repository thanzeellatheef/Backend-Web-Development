const service = require('../services/postService');
const http = require('../utils/http');

function listPosts(req, res) {
  const result = service.listPosts(req.query);

  return http.sendList(res, result.data, result.meta);
}

function getPost(req, res) {
  const post = service.getPost(req.params.id);

  if (!post) {
    return http.sendError(
      res,
      404,
      'POST_NOT_FOUND',
      'Post not found'
    );
  }

  return http.sendOk(res, post);
}

function createPost(req, res) {
  const post = service.createPost(req.body);

  return http.sendCreated(res, post);
}

function likePost(req, res) {
  try {
    const post = service.likePost(req.params.id);

    return http.sendOk(res, {
      id: post.id,
      likes: post.likes
    });
  } catch (err) {
    return http.sendError(
      res,
      err.statusCode || 500,
      err.code || 'INTERNAL_ERROR',
      err.statusCode === 404
        ? err.message
        : 'An internal server error occurred'
    );
  }
}

function explode(req, res) {
  try {
    service.explode();
  } catch (err) {
    return http.sendError(
      res,
      500,
      'INTERNAL_ERROR',
      'An internal server error occurred'
    );
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
