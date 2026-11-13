import express from 'express';
const postRouter = express.Router();
import { posts, categories, comments, likes } from '../db.js'

// ---------- Helpers ----------

// Next numeric id for an in-memory collection
const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id), 0) + 1

// Parse a positive integer, falling back to a default when invalid
const toPositiveInt = (value, fallback) => {
    const n = Number(value)
    return Number.isInteger(n) && n > 0 ? n : fallback
}

// Remove every item matching the predicate from an array, in place
const removeWhere = (list, predicate) => {
    for (let i = list.length - 1; i >= 0; i--) {
        if (predicate(list[i])) list.splice(i, 1)
    }
}

const findPost = (id) => posts.find((p) => p.id === Number(id))

// Responds 404 and returns null when the post doesn't exist
const requirePost = (req, res) => {
    const post = findPost(req.params.postId ?? req.params.id)
    if (!post) {
        res.status(404).json({ error: 'Post not found' })
        return null
    }
    return post
}

// GET http://localhost:3000/
// Optional query: ?search=...&category=...&page=...&limit=...
postRouter.get('/', (req, res) => {
    const page = toPositiveInt(req.query.page, 1)
    const limit = toPositiveInt(req.query.limit, 10)
    const { search, category } = req.query

    let result = posts

    if (category) {
        // category can be an id, a slug, or a name
        const key = String(category).toLowerCase()
        const matched = categories.find((c) =>
            String(c.id) === key || c.slug === key || c.name.toLowerCase() === key
        )
        result = matched ? result.filter((p) => p.categoryId === matched.id) : []
    }

    if (search) {
        const term = String(search).toLowerCase()
        result = result.filter((p) =>
            p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term)
        )
    }

    const total = result.length
    const start = (page - 1) * limit

    res.status(200).json({
        data: result.slice(start, start + limit),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    })
})

// GET http://localhost:3000//{id}
postRouter.get('/:id', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return
    res.status(200).json(post)
})

// POST http://localhost:3000/
postRouter.post('/', (req, res) => {
    const { title, content, author, categoryId } = req.body ?? {}

    if (!title || !content || !author || categoryId === undefined) {
        return res.status(400).json({ error: 'title, content, author and categoryId are required' })
    }
    if (!categories.some((c) => c.id === Number(categoryId))) {
        return res.status(400).json({ error: 'categoryId does not exist' })
    }

    const now = new Date().toISOString()
    const post = {
        id: nextId(posts),
        title,
        content,
        author,
        categoryId: Number(categoryId),
        createdAt: now,
        updatedAt: now,
    }
    posts.push(post)
    res.status(201).json(post)
})

// PATCH http://localhost:3000//{id}
postRouter.patch('/:id', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const { title, content, author, categoryId } = req.body ?? {}

    if (categoryId !== undefined && !categories.some((c) => c.id === Number(categoryId))) {
        return res.status(400).json({ error: 'categoryId does not exist' })
    }

    if (title !== undefined) post.title = title
    if (content !== undefined) post.content = content
    if (author !== undefined) post.author = author
    if (categoryId !== undefined) post.categoryId = Number(categoryId)
    post.updatedAt = new Date().toISOString()

    res.status(200).json(post)
})

// DELETE http://localhost:3000//{id}
postRouter.delete('/:id', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    posts.splice(posts.indexOf(post), 1)
    // Remove the post's comments and likes too
    removeWhere(comments, (c) => c.postId === post.id)
    removeWhere(likes, (l) => l.postId === post.id)

    res.status(204).send()
})

// ---------- Comments ----------

// GET http://localhost:3000//{postId}/comments
postRouter.get('/:postId/comments', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return
    res.status(200).json(comments.filter((c) => c.postId === post.id))
})

// GET http://localhost:3000//{postId}/comments/{commentId}
postRouter.get('/:postId/comments/:commentId', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const comment = comments.find((c) => c.id === Number(req.params.commentId) && c.postId === post.id)
    if (!comment) return res.status(404).json({ error: 'Comment not found' })
    res.status(200).json(comment)
})

// POST http://localhost:3000//{postId}/comments
postRouter.post('/:postId/comments', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const { author, content } = req.body ?? {}
    if (!author || !content) {
        return res.status(400).json({ error: 'author and content are required' })
    }

    const comment = {
        id: nextId(comments),
        postId: post.id,
        author,
        content,
        createdAt: new Date().toISOString(),
    }
    comments.push(comment)
    res.status(201).json(comment)
})

// PATCH http://localhost:3000//{postId}/comments/{commentId}
postRouter.patch('/:postId/comments/:commentId', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const comment = comments.find((c) => c.id === Number(req.params.commentId) && c.postId === post.id)
    if (!comment) return res.status(404).json({ error: 'Comment not found' })

    const { content } = req.body ?? {}
    if (!content) return res.status(400).json({ error: 'content is required' })

    comment.content = content
    res.status(200).json(comment)
})

// DELETE http://localhost:3000//{postId}/comments/{commentId}
postRouter.delete('/:postId/comments/:commentId', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const index = comments.findIndex((c) => c.id === Number(req.params.commentId) && c.postId === post.id)
    if (index === -1) return res.status(404).json({ error: 'Comment not found' })

    comments.splice(index, 1)
    res.status(204).send()
})

// ---------- Post likes ----------
// There is no auth, so the liking user is identified by `userId`
// (JSON body or query string).

const getUserId = (req) => {
    const raw = req.body?.userId ?? req.query.userId
    const userId = Number(raw)
    return raw !== undefined && Number.isInteger(userId) ? userId : null
}

// GET http://localhost:3000/api/posts/{id}/likes
postRouter.get('/api/posts/:id/likes', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const postLikes = likes.filter((l) => l.postId === post.id)
    res.status(200).json({
        postId: post.id,
        count: postLikes.length,
        likes: postLikes,
    })
})

// POST http://localhost:3000/api/posts/{id}/likes   body: { "userId": 101 }
postRouter.post('/api/posts/:id/likes', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const userId = getUserId(req)
    if (userId === null) return res.status(400).json({ error: 'userId is required' })

    if (likes.some((l) => l.postId === post.id && l.userId === userId)) {
        return res.status(409).json({ error: 'User already liked this post' })
    }

    const like = { id: nextId(likes), postId: post.id, userId }
    likes.push(like)
    res.status(201).json(like)
})

// DELETE http://localhost:3000/api/posts/{id}/likes   body or query: userId
postRouter.delete('/api/posts/:id/likes', (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const userId = getUserId(req)
    if (userId === null) return res.status(400).json({ error: 'userId is required' })

    const index = likes.findIndex((l) => l.postId === post.id && l.userId === userId)
    if (index === -1) return res.status(404).json({ error: 'Like not found' })

    likes.splice(index, 1)
    res.status(204).send()
})

export default postRouter