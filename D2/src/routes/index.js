import postRouter from "./posts.route.js";
import categoriesRoter from "./categories.route.js";

import express from 'express';
const router = express.Router();

router.use('/posts', postRouter)
router.use('/categories', categoriesRoter)

export default router