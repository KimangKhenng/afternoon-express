import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    categoryId: mongoose.Types.ObjectId
}, {
    timestamps: true
})

export const postModel = mongoose.model('posts', postSchema)