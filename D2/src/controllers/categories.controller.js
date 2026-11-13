import { categories, posts } from '../db.js'
import { nextId, slugify, isTaken, isNonEmptyString, requireCategory } from '../utils/helpers.js'

export const getAllCategories = (req, res) => {
    res.status(200).json(categories)
}

export const getCategoryById = (req, res) => {
    const category = requireCategory(req, res)
    if (!category) return
    res.status(200).json(category)
}

// body: { "name": "...", "slug"?: "..." }
export const createCategory = (req, res) => {
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
}

// body: { "name"?: "...", "slug"?: "..." }
export const updateCategory = (req, res) => {
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
}

export const deleteCategory = (req, res) => {
    const category = requireCategory(req, res)
    if (!category) return

    // Posts require a valid categoryId, so don't orphan them
    if (posts.some((p) => p.categoryId === category.id)) {
        return res.status(409).json({ error: 'Category is used by existing posts and cannot be deleted' })
    }

    categories.splice(categories.indexOf(category), 1)
    res.status(204).send()
}
