const bcrypt = require('bcryptjs');
const User = require('../models/user');
const UserStudent = require('../models/userStudent');
const UserFaculty = require('../models/userFaculty');
const nodemailer = require('nodemailer');
const Batch = require('../models/batch');

const batchPromise = Batch.findOne({ where: { isActive: true }})

const crypto = require('crypto');

function generateToken() {
    return crypto.randomBytes(16).toString('hex');
}
const token = generateToken();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'capstone.requirements@gmail.com',
        pass: 'hlifsvddrfzyhivk'
    }
})

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
        .then (doMatch => {
            if (doMatch) {
                req.session.user = user;
                req.session.isLoggedIn = true;
                return req.session.save(err => {
                    console.log(err)
                    if(req.session.user.role === "Student") {
                        return res.redirect('/student/home');
                    }
                    if(req.session.user.role === "Faculty") {
                        return res.redirect('/faculty/home');
                    }
                    
                })
            }
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
    const section = req.body.section;

    batchPromise.then(activeBatch => {
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
                role: role,
                password: hashedPassword,
                emailVerified: 'unverified',
                token: token
            })
            return user.save();
        })
        .then(user => {
            console.log(user.role)
            if(user.role === "Student") {
                UserStudent.create({
                    userId: user.id,
                    section: section,
                    batchId: activeBatch.id
                })
            }
            var message = {
                from: 'capstone.requirements@gmail.com',
                to: user.email,
                subject: 'Email Verification',
                text: 'Click the link to verify your email: http://localhost:3000/auth/verify?token='+ user.token 
            };
            transporter.sendMail(message, (error, info) => {
                if(error) {
                    console.log('Send mail error: ' + error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            })
            res.redirect('/auth/login')
        })
    })
    .catch(err => console.log(err))
    })
    
};

exports.getVerify = (req, res, next) => {
    const token = req.query.token;
    User.findOne({ where: { token: token } })
    .then(user => {
        if(user) {
            user.update({
                emailVerified: true
            })
            res.send('Email verified!');
        } else {
            res.send('Token not found!');
        }
    })
    .catch(err => console.log(err))
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/auth/login')
    })
};