import express from 'express'
import router from './routes/index.js';
import morgan from 'morgan'
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middlewares/index.js';
import { connectDB } from './db/index.js';

const app = express()

connectDB()

// Middleware
app.use(express.json()); // Parse JSON bodies, req.body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use(morgan('combined'));
app.use(helmet());

// app.use(middle1)
// app.use(middle2)

app.use('/api', router)

app.use(notFoundHandler)
app.use(errorHandler)

// For checking if request login or not, authorization or not, cache 


// app.get('/hello', middle1, middle2, (req, res) => {
//     res.send("Hello World")
// })

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
