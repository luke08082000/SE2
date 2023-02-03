const User = require('../models/user');
const Submission = require('../models/submission');

exports.getHome = (req, res) => {
    const role = req.session.user.role;
    res.render('home', {
        role: role
    });
};

exports.getActivities = (req, res) => {
    const role = req.session.user.role;
    res.render('activities', {
        role: role
    });
};

exports.postActivities = (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const deadline = req.body.deadline;
    User.findByPk(req.session.user.id)
    .then(user => {
        user.createSubmission({
            title: title,
            description: description,
            deadline: deadline
        })
    })
    .then(result => {
        res.redirect('/capstone-projects');
    })
    .catch(err => console.log(err))
}

exports.getCapstoneProjects = (req, res) => {
    const role = req.session.user.role;
    Submission.findAll()
    .then(submissionForms => {
        res.render('capstone-projects', {
            forms: submissionForms,
            role: role,
            status: submissionForms.status
        });
    })
    .catch(err => console.log(err))
};

exports.postCapstoneProjects = (req, res) => {
    const formId = req.body.formId;
    const fileName = req.body.file;
    Submission.findByPk(formId)
    .then(submission => {
        submission.update({ 
            fileName: fileName,
            status: 'Submitted'
        })
        res.redirect('/capstone-projects');
    })
    .catch(err => console.log(err))
}

exports.getGroup = (req, res) => {
    const role = req.session.user.role;
    res.render('group', {
        role: role
    });
};

