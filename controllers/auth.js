const bcrypt = require('bcryptjs');
const User = require('../models/user');
const sgMail = require('@sendgrid/mail');
const SENDGRID_API_KEY = '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';

sgMail.setApiKey(SENDGRID_API_KEY);

exports.getLogin = (req, res, next) => {
    res.render('auth/login')
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ where: { email: email }})
    .then(user => {
        if (!user) {
            return res.redirect('/auth/login')
        }
        bcrypt
        .compare(password, user.password)
        .then(doMatch => {
            if (doMatch) {
                req.session.user = user;
                req.session.isLoggedIn = true;
                return req.session.save(err => {
                    console.log(err)
                    return res.redirect('/home');
                })
            }
            console.log('dumaan dito');
            res.redirect('/auth/login')
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
};

exports.getRegister = (req, res, next) => {
    res.render('auth/register')
};

exports.postRegister = (req, res, next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const role = req.body.role;
    User.findOne({ where: { email: email } })
    .then(userDoc => {
        if(userDoc) {
            return res.redirect('/')
        }
        return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            console.log( "This is my role: " + role);
            const user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                role: role,
                password: hashedPassword
            })
            return user.save();
        })
        .then(user => {
            sgMail.send({
                to: email,
                from: 'luke.manongsong@gmail.com',  //temp email na verified ng sendgrid
                subject: 'Congratulations! You have successfuly created an account.',
                text: 'and easy to do anywhere, even with Node.js',
                html: '<strong>and easy to do anywhere, even with Node.js</strong>'
            });
            res.redirect('/auth/login')
        })
    })
    .catch(err => console.log(err))
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/auth/login')
    })
};