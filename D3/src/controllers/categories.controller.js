import { categories, posts } from '../db.js'
import { categoryModel } from '../models/category.model.js'
import { nextId, slugify, isTaken, isNonEmptyString, requireCategory } from '../utils/helpers.js'

export const getAllCategories = async (req, res) => {
    const categories = await categoryModel.find()
    res.status(200).json(categories)
}

export const getCategoryById = async (req, res) => {
    // const category = requireCategory(req, res)
    const category = await categoryModel.findById(req.params.id)
    if (!category) return
    res.status(200).json(category)
}

// body: { "name": "...", "slug"?: "..." }
export const createCategory = async (req, res) => {
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

    const category = { name: cleanName, slug: cleanSlug }

    const newCategory = new categoryModel(category)
    await newCategory.save()

    res.status(201).json(category)
}

// body: { "name"?: "...", "slug"?: "..." }
export const updateCategory = async (req, res) => {
    // const category = requireCategory(req, res)
    // if (!category) return

    const { name, slug } = req.body ?? {}

    if (name !== undefined && !isNonEmptyString(name)) {
        return res.status(400).json({ error: 'name must be a non-empty string' })
    }
    if (slug !== undefined && !isNonEmptyString(slug)) {
        return res.status(400).json({ error: 'slug must be a non-empty string' })
    }

    const newCategory = await categoryModel.findByIdAndUpdate(req.params.id, {
        name: name,
        slug: slug
    })

    res.status(200).json(newCategory)
}

export const deleteCategory = async (req, res) => {
    const deleted = await categoryModel.findByIdAndDelete(req.params.id)
    res.status(204).json(deleted)
}
