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
    if (!category) return res.status(200).json({})
    res.status(200).json(category)
}

// body: { "name": "...", "slug"?: "..." }
export const createCategory = async (req, res) => {
    const { name, slug } = req.body ?? {}

    const newCategory = new categoryModel({
        name,
        slug
    })
    await newCategory.save()

    res.status(201).json(newCategory)
}

export const updateCategory = async (req, res) => {
    const { name, slug } = req.body ?? {}
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
