const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        if (typeof next === 'function') {
            next(err);
        } else {
            // Fallback for cases where next is accidentally missing or not a function
            console.error('AsyncHandler caught error but next is not a function:', err);
            res.status(500).json({ message: err.message || 'Internal Server Error' });
        }
    });
};

export default asyncHandler;
