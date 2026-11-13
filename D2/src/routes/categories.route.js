import express from 'express'
import { categories, posts } from '../db.js'
const categoriesRoter = express.Router()

// ---------- Helpers ----------

const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id), 0) + 1

const slugify = (text) =>
    String(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

// Is the name or slug already used by another category?
const isTaken = (name, slug, ignoreId) =>
    categories.some((c) =>
        c.id !== ignoreId && (c.slug === slug || c.name.toLowerCase() === name.toLowerCase())
    )

const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== ''

// Responds 404 and returns null when the category doesn't exist
const requireCategory = (req, res) => {
    const category = categories.find((c) => c.id === Number(req.params.id))
    if (!category) {
        res.status(404).json({ error: 'Category not found' })
        return null
    }
    return category
}

// ---------- Routes ----------

// GET http://localhost:3000/api/categories
categoriesRoter.get('/', (req, res) => {
    res.status(200).json(categories)
})

// GET http://localhost:3000/api/categories/{id}
categoriesRoter.get('/:id', (req, res) => {
    const category = requireCategory(req, res)
    if (!category) return
    res.status(200).json(category)
})

// POST http://localhost:3000/api/categories   body: { "name": "...", "slug"?: "..." }
categoriesRoter.post('/', (req, res) => {
    const { name, slug } = req.body ?? {}

    if (!isNonEmptyString(name)) {
        return res.status(400).json({ error: 'name is required' })
    }
    if (slug !== undefined && !isNonEmptyString(slug)) {
        return res.status(400).json({ error: 'slug must be a non-empty string' })
    }

    const cleanName = name.trim()
    const cleanSlug = slugify(slug ?? cleanName)
    if (!cleanSlug) {
        return res.status(400).json({ error: 'slug could not be generated from name' })
    }
    if (isTaken(cleanName, cleanSlug)) {
        return res.status(409).json({ error: 'A category with this name or slug already exists' })
    }

    const category = { id: nextId(categories), name: cleanName, slug: cleanSlug }
    categories.push(category)
    res.status(201).json(category)
})

// PATCH http://localhost:3000/api/categories/{id}   body: { "name"?: "...", "slug"?: "..." }
categoriesRoter.patch('/:id', (req, res) => {
    const category = requireCategory(req, res)
    if (!category) return

    const { name, slug } = req.body ?? {}

    if (name !== undefined && !isNonEmptyString(name)) {
        return res.status(400).json({ error: 'name must be a non-empty string' })
    }
    if (slug !== undefined && !isNonEmptyString(slug)) {
        return res.status(400).json({ error: 'slug must be a non-empty string' })
    }

    const newName = name !== undefined ? name.trim() : category.name
    const newSlug = slug !== undefined ? slugify(slug) : category.slug
    if (!newSlug) {
        return res.status(400).json({ error: 'slug is invalid' })
    }
    if (isTaken(newName, newSlug, category.id)) {
        return res.status(409).json({ error: 'A category with this name or slug already exists' })
    }

    category.name = newName
    category.slug = newSlug
    res.status(200).json(category)
})

// DELETE http://localhost:3000/api/categories/{id}
categoriesRoter.delete('/:id', (req, res) => {
    const category = requireCategory(req, res)
    if (!category) return

    // Posts require a valid categoryId, so don't orphan them
    if (posts.some((p) => p.categoryId === category.id)) {
        return res.status(409).json({ error: 'Category is used by existing posts and cannot be deleted' })
    }

    categories.splice(categories.indexOf(category), 1)
    res.status(204).send()
})

export default categoriesRoter
