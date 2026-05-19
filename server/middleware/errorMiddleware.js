
const errorHandler = (err, req, res, next) => {

    console.log(err.stack);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};
// so with this :

// const errorHandler = require("./middleware/errorMiddleware");
// app.use(errorHandler);

// we can use it like this
module.exports = errorHandler;