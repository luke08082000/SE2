const User = require('../models/user');
const Submission = require('../models/submission');
const Group = require('../models/group');
const Membership = require('../models/membership');


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
    const email = req.session.email;
    User.findByPk(req.session.user.id)
    .then(user => {
        user.createSubmission({
            title: title,
            description: description,
            deadline: deadline,
            createdBy: email
        })
    })
    .then(result => {
        res.redirect('/capstone-projects');
    })
    .catch(err => console.log(err))
}



exports.getCapstoneProjects = (req, res) => {
    const role = req.session.user.role;
    const url = '/pdf-files/pdf.pdf'
    Submission.findAll()
    .then(submissionForms => {
        res.render('capstone-projects', {
            url: url,
            forms: submissionForms,
            role: role,
            status: submissionForms.status
        });
    })
    .catch(err => console.log(err))
};


exports.postCapstoneProjects = (req, res) => {
    const filePath = req.file.path.substring(6) // to exclude public folder
    const fileName = req.file.filename;
    const formId = req.body.formId;
    const email = req.session.user.email;
    Submission.findByPk(formId)
    .then(submission => {
        submission.update({ 
            fileName: fileName,
            filePath: filePath,
            status: 'Submitted',
            submittedBy: email
        })
        res.redirect('/capstone-projects');
    })
    .catch(err => console.log(err))
}

exports.getGroup = (req, res) => {
    const role = req.session.user.role;
    const hasGroup = req.session.user.groupId;
    Group.findAll({
        include: [{
            model: User,
            through: Membership
        }]
    })
    .then(groups => {
        res.render('group', {
            group: groups,
            role: role,
            hasGroup: hasGroup
        })
    })
    .catch(err => console.log(err))    
};

exports.postGroup = (req, res) => {
    if (req.session.user.role === "Faculty") { //create group as a faculty
        Group.create()
        .then(group => {
            console.log('new group created');
            res.redirect('/group');
        })
    } else if (req.session.user.role === "Student") { //join group as a student
        const groupId = req.body.groupId;
        const userId = req.session.user.id;
        Membership.findOne({ where: { userId: userId } })
            .then(member => {
                if (member) {
                    console.log('You already belong to a group')
                    res.redirect('/group');
                } else {
                    Group.findOne({ where: { id:  groupId } })
                        .then(group => {
                            Membership.create({ userId: userId, groupId: groupId })
                            .then(member => {
                                res.redirect('/group');
                            })
                        }).catch(err => console.log(err))
                }
            })
        .catch(err => console.log(err))
    }
}
