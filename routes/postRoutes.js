const express = require('express');
const router = express.Router();
const postController = require('../controllers/PostController');

router.post('/', postController.upload.single('image'), postController.createPost);
router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.upload.single('image'), postController.updatePost);
router.delete('/:id', postController.deletePost);
router.post('/:id/like', postController.likePost); // Route cho like
router.post('/:id/comment', postController.addComment); // Route cho comment

module.exports = router;