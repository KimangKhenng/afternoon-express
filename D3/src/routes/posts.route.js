import express from 'express'
import {
    getAllPosts, getPostById, createPost, updatePost, deletePost,
    getComments, getCommentById, createComment, updateComment, deleteComment,
    getLikes, createLike, deleteLike,
} from '../controllers/posts.controller.js'

const postRouter = express.Router()

// Posts: /api/posts
// GET list accepts ?search=...&category=...&page=...&limit=...
postRouter.get('/', getAllPosts)
postRouter.get('/:id', getPostById)
postRouter.post('/', createPost)
postRouter.patch('/:id', updatePost)
postRouter.delete('/:id', deletePost)

// Comments: /api/posts/{postId}/comments
postRouter.get('/:postId/comments', getComments)
postRouter.get('/:postId/comments/:commentId', getCommentById)
postRouter.post('/:postId/comments', createComment)
postRouter.patch('/:postId/comments/:commentId', updateComment)
postRouter.delete('/:postId/comments/:commentId', deleteComment)

// Likes: /api/posts/{id}/likes   (userId in JSON body or query string)
postRouter.get('/:id/likes', getLikes)
postRouter.post('/:id/likes', createLike)
postRouter.delete('/:id/likes', deleteLike)

export default postRouter
