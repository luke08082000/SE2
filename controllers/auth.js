const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('login')
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ where: { email: email }})
    .then(user => {
        if (!user) {
            console.log('dumaan dito')
            return res.redirect('/login')
        }
        bcrypt
        .compare(password, user.password)
        .then(doMatch => {
            if (doMatch) {
                req.session.user = user;
                req.session.isLoggedIn = true;
                return req.session.save(err => {
                    console.log(err)
                    return res.redirect('/student/home');
                })
            }
            console.log(req.session);
            res.redirect('/login')
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
};

exports.getRegister = (req, res, next) => {
    res.render('register')
};

exports.postRegister = (req, res, next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ where: { email: email } })
    .then(userDoc => {
        if(userDoc) {
            return res.redirect('/')
        }
        return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword
            })
            return user.save();
        })
        .then(user => {
            res.redirect('/login')
        })
    })
    .catch(err => console.log(err))
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/login')
    })
};