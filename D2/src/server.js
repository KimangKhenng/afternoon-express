import express from 'express'
import router from './routes/index.js';
const app = express()

// Middleware
app.use(express.json()); // Parse JSON bodies, req.body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use('/api', router)

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
