exports.get404 = (req, res) => {
    const role = req.session.user.role;
    res.render('404', { role: role })
}