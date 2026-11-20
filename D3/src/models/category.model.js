import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: String,
    slug: String,
}, {
    timestamps: true
})

export const categoryModel = mongoose.model('categories', categorySchema)