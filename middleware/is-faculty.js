module.exports = (req, res, next) => {
    if (req.session.user.role !== "Faculty") {
        return res.redirect('/home')
    }
    next();
}