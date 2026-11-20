import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: String,
        required: true,
        trim: true,
    },
    categoryId: {
        type: mongoose.Types.ObjectId,
        required: true,
    }
}, {
    timestamps: true
})

export const postModel = mongoose.model('posts', postSchema)