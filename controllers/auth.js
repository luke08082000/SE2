const bcrypt = require('bcryptjs');
const User = require('../models/user');
const UserStudent = require('../models/userStudent');
const UserFaculty = require('../models/userFaculty');
const nodemailer = require('nodemailer');
const Batch = require('../models/batch');
const { validationResult } = require('express-validator/check');


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
    res.render('auth/login', {
        errorMessage: req.flash('error')
    })
};


exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ where: { email: email }})
    .then(user => {
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.render('auth/login', {
                errorMessage: req.flash('error')
            })
        }
        bcrypt
        .compare(password, user.password)
        .then (doMatch => {
            if(!doMatch) {
                req.flash('error', 'Invalid email or password.');
                return res.render('auth/login', {
                    errorMessage: req.flash('error')
                })
            }
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

exports.getFacultyRegister = (req, res) => {
    res.render('auth/faculty-register', {
        errorMessage: req.flash('error')
    });
}

exports.getStudentRegister = (req, res) => {
    res.render('auth/student-register', {
        errorMessage: req.flash('error')
    });
}

exports.postRegister = (req, res, next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const role = req.body.role;
    const section = req.body.section;
    const employeeId = req.body.employeeId;
    const studentId = req.body.studentId;

    console.log('this is the role: ' + role);
    User.findOne({ where: { email: email } })
        .then(userDoc => {
        if(userDoc) {
            req.flash('error', 'Email already exists.')
            if (role == 'faculty') {
                return res.render('auth/faculty-register', {
                    errorMessage: req.flash('error')
                })
            }
            if (role == 'student') {
                return res.render('auth/student-register', {
                    errorMessage: req.flash('error')
                })
            }
            
        }
        if(password !== confirmPassword) {
            req.flash('error', 'Passwords do not match.')
            if (role == 'faculty') {
                return res.render('auth/faculty-register', {
                    errorMessage: req.flash('error')
                })
            }
            if (role == 'student') {
                return res.render('auth/student-register', {
                    errorMessage: req.flash('error')
                })
            }
        }
        if(password.length <= 8 || password.length >= 16) {
            req.flash('error', 'Password must be 8 to 16 characters long.')
            if (role == 'faculty') {
                return res.render('auth/faculty-register', {
                    errorMessage: req.flash('error')
                })
            }
            if (role == 'student') {
                return res.render('auth/student-register', {
                    errorMessage: req.flash('error')
                })
            }
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
                token: token,
                employee_id: role == 'faculty' ? employeeId : 0

        })
        return user.save();
        })
        .then(user => {
            console.log(user.role + ' this is the role')
            if(user.role == "student") {
                UserStudent.create({
                    userId: user.id,
                    section: section,
                    studentId: studentId
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
    
};

exports.getVerify = (req, res, next) => {
    const token = req.query.token;
    User.findOne({ where: { token: token } })
    .then(user => {
        if(user) {
            user.update({
                emailVerified: 'verified'
            })
            res.send('Email verified! You can close this tab now.');
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

exports.getChangePassword = (req, res) => {
    const role = req.session.user.role;

    res.render('change-password', {
        role: role
    })
}

exports.postChangePassword = (req, res) => {
    const oldPass = req.body.oldPassword;
    const newPass = req.body.newPassword;
    const userId = req.session.user.id;

    User.findByPk(userId).then(user => {
        bcrypt
        .compare(oldPass, user.password)
        .then (doMatch => {
            if (doMatch) {
                bcrypt
                    .hash(newPass, 12)
                    .then(hashedPassword => {
                        user.update({ password: hashedPassword })
                        return user.save()
                })
            } else {
                console.log('Incorrect Password!')
            }
            console.log('password successfully changed!')
            res.redirect('/auth/change-password')
        })
        .catch(e => console.log(e))
    })
    .catch(e => console.log(e))
}

exports.getChangeEmail = (req, res) => {
    const role = req.session.user.role;

    res.render('change-email', {
        role: role
    })
}

exports.postChangeEmail = (req, res, next) => {
    const newEmail = req.body.newEmail;
    const userId = req.session.user.id;

    User.findByPk(userId).then(user => {
        user.update({ token: token })
        return user.save()
    })
    .then(user => {
        var message = {
        from: 'capstone.requirements@gmail.com',
        to: newEmail,
        subject: 'Update Email Verification',
        text: 'Click the link to verify your new email: http://localhost:3000/auth/verify?token='+ user.token 
    }
    transporter.sendMail(message, (error, info) => {
        if(error) {
            console.log('Send mail error: ' + error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
        user.update({ email: newEmail })
        user.save();
        res.redirect('/auth/change-email')
    })

}

exports.getForgotPassword = (req, res) => {
    res.render('auth/forgot-password');
}

exports.postForgotPassword = (req, res) => {
    const email = req.body.email;

    User.findOne({ where: { email: email }}).then(user => {
        if(!user) {
            console.log('Email not registered')
            return res.redirect('/auth/forgot-password')
        } 
        var message = {
            from: 'capstone.requirements@gmail.com',
            to: email,
            subject: 'Password Recovery',
            html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:3000/auth/reset-password/${user.token}">link</a> to set a new password</p>
            `
        }
        transporter.sendMail(message, (error, info) => {
            if(error) {
                console.log('Send mail error: ' + error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        })
            res.redirect('/auth/forgot-password')
    })
}

exports.getResetPassword = (req, res) => {
    const token = req.params.token;

    res.render('auth/reset', {
        token: token
    });
}

exports.postResetPassword = (req, res) => {
    const userToken = req.body.userToken;
    const password = req.body.password;

    User.findOne({ where: { token: userToken }}).then(user => {
        bcrypt.hash(password, 12).then(hashedPassword => {
            user.update({ password: hashedPassword })
            return user.save();
        })
    })
    res.redirect('/auth/login')
    .catch(e => console.log(e))
}