import express from 'express'
import { posts, categories, comments, likes } from './db.js'
const app = express()

// Middleware
app.use(express.json()); // Parse JSON bodies, req.body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies



// GET http://localhost:3000/api/posts
app.get('/api/posts', (req, res) => {
    res.status(200).json(posts)
})

// GET http://localhost:3000/api/posts/{id}
app.get('/api/posts/:id', (req, res) => {
    const Id = Number(req.params.id)
    const post = posts.find((p) => {
        return p.id === Id
    })
    console.log(post)
    res.status(200).json(post)
})

// POST http://localhost:3000/api/posts
app.post('/api/posts', (req, res) => {
    posts.push(req.body)
    res.json(req.body)
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})