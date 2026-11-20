export const middle1 = (req, res, next) => {
    console.log("Hello WOrld before")
    if (req.query.pass === '1') {
        next()
    } else {
        return res.status(403).send("No permission")
    }
}

export const middle2 = (req, res, next) => {
    console.log("Hello WOrld before 1")
    if (req.query.pass2 === '2') {
        next()
    } else {
        return res.status(403).send("No permission 2")
    }
}

export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!'
    });
}

export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: `Route not found: ${req.method} ${req.originalUrl}`
    });
}
