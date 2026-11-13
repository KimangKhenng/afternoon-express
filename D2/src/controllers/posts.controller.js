import { posts, categories, comments, likes } from '../db.js'
import { nextId, toPositiveInt, removeWhere, requirePost } from '../utils/helpers.js'

// ---------- Posts ----------

// Optional query: ?search=...&category=...&page=...&limit=...
export const getAllPosts = (req, res) => {
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
}

export const getPostById = (req, res) => {
    const post = requirePost(req, res)
    if (!post) return
    res.status(200).json(post)
    // throw Error('Not found')
}

export const createPost = (req, res) => {
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
}

export const updatePost = (req, res) => {
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
}

export const deletePost = (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    posts.splice(posts.indexOf(post), 1)
    // Remove the post's comments and likes too
    removeWhere(comments, (c) => c.postId === post.id)
    removeWhere(likes, (l) => l.postId === post.id)

    res.status(204).send()
}

// ---------- Comments ----------

const findComment = (req, post) =>
    comments.find((c) => c.id === Number(req.params.commentId) && c.postId === post.id)

export const getComments = (req, res) => {
    const post = requirePost(req, res)
    if (!post) return
    res.status(200).json(comments.filter((c) => c.postId === post.id))
}

export const getCommentById = (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const comment = findComment(req, post)
    if (!comment) return res.status(404).json({ error: 'Comment not found' })
    res.status(200).json(comment)
}

export const createComment = (req, res) => {
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
}

export const updateComment = (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const comment = findComment(req, post)
    if (!comment) return res.status(404).json({ error: 'Comment not found' })

    const { content } = req.body ?? {}
    if (!content) return res.status(400).json({ error: 'content is required' })

    comment.content = content
    res.status(200).json(comment)
}

export const deleteComment = (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const comment = findComment(req, post)
    if (!comment) return res.status(404).json({ error: 'Comment not found' })

    comments.splice(comments.indexOf(comment), 1)
    res.status(204).send()
}

// ---------- Likes ----------
// There is no auth, so the liking user is identified by `userId`
// (JSON body or query string).

const getUserId = (req) => {
    const raw = req.body?.userId ?? req.query.userId
    const userId = Number(raw)
    return raw !== undefined && Number.isInteger(userId) ? userId : null
}

export const getLikes = (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const postLikes = likes.filter((l) => l.postId === post.id)
    res.status(200).json({
        postId: post.id,
        count: postLikes.length,
        likes: postLikes,
    })
}

export const createLike = (req, res) => {
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
}

export const deleteLike = (req, res) => {
    const post = requirePost(req, res)
    if (!post) return

    const userId = getUserId(req)
    if (userId === null) return res.status(400).json({ error: 'userId is required' })

    const index = likes.findIndex((l) => l.postId === post.id && l.userId === userId)
    if (index === -1) return res.status(404).json({ error: 'Like not found' })

    likes.splice(index, 1)
    res.status(204).send()
}
