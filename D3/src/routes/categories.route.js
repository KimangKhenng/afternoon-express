import express from 'express'
import {
    getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
} from '../controllers/categories.controller.js'

const categoriesRoter = express.Router()

// /api/categories
categoriesRoter.get('/', getAllCategories)
categoriesRoter.get('/:id', getCategoryById)
categoriesRoter.post('/', createCategory)
categoriesRoter.put('/:id', updateCategory)
categoriesRoter.delete('/:id', deleteCategory)

export default categoriesRoter
