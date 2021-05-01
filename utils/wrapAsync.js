module.exports = function wrapAsync(fn) {
    return function (req, res, next) { //return a function with catch() tagged on
        fn(req, res, next).catch(e => {
            next(e) //pass error to next error handler
        }) 
    }
}