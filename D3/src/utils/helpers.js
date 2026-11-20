import { categories, posts } from '../db.js'

// Next numeric id for an in-memory collection
export const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id), 0) + 1

// Parse a positive integer, falling back to a default when invalid
export const toPositiveInt = (value, fallback) => {
    const n = Number(value)
    return Number.isInteger(n) && n > 0 ? n : fallback
}

// Remove every item matching the predicate from an array, in place
export const removeWhere = (list, predicate) => {
    for (let i = list.length - 1; i >= 0; i--) {
        if (predicate(list[i])) list.splice(i, 1)
    }
}

export const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== ''

// ---------- Posts ----------

const findPost = (id) => posts.find((p) => p.id === Number(id))

// Responds 404 and returns null when the post doesn't exist
export const requirePost = (req, res) => {
    const post = findPost(req.params.postId ?? req.params.id)
    if (!post) {
        res.status(404).json({ error: 'Post not found' })
        return null
    }
    return post
}

// ---------- Categories ----------

export const slugify = (text) =>
    String(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

// Is the name or slug already used by another category?
export const isTaken = (name, slug, ignoreId) =>
    categories.some((c) =>
        c.id !== ignoreId && (c.slug === slug || c.name.toLowerCase() === name.toLowerCase())
    )

// Responds 404 and returns null when the category doesn't exist
export const requireCategory = (req, res) => {
    const category = categories.find((c) => c.id === Number(req.params.id))
    if (!category) {
        res.status(404).json({ error: 'Category not found' })
        return null
    }
    return category
}
