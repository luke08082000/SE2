const User = require('../models/user');
const Submission = require('../models/submission');
const SubmissionForm = require('../models/submissionForm');
const Group = require('../models/group');
const Membership = require('../models/membership');


exports.getHome = (req, res) => {
    const role = req.session.user.role;
    const firstName = req.session.user.firstName;
    const lastName = req.session.user.lastName;
    const email = req.session.user.email;
    const groupId = req.session.user.groupId;
    const section = req.session.user.section;
    Group.findOne({ where: {id: groupId} })
    .then(group => {
        res.render('home', {
            role: role,
            firstName: firstName,
            lastName: lastName,
            email: email,
            section: section,
            groupName: !group ? 'No group yet' : group.name
        })
    })
};

exports.getActivities = (req, res) => {
    const role = req.session.user.role;
    const section = req.session.user.section;
    if (role === "Student") {
        SubmissionForm.findAll({
            include: [{
                model: Submission,
                as: 'submissions'
            }]
        })
        .then(forms => {
            res.render('activities', {
                forms: forms,
                role: role,
                section: section,
                status: forms.status
            });
        })
        .catch(err => console.log(err))
    }
    if (role === "Faculty") {
        res.render('activities', {
            role: role
        })
    }
};

exports.postActivities = (req, res) => {
    const role = req.session.user.role;
    if (role === "Student") {
        const filePath = req.file.path.substring(6) // to exclude public folder
        const fileName = req.file.filename;
        const formId = req.body.formId;
        const email = req.session.user.email;
        SubmissionForm.findByPk(formId)
        .then(submission => {
            Submission.create ({ 
                fileName: fileName,
                filePath: filePath,
                status: 'Pending',
                submittedBy: email,
                userId: req.session.user.id,
                submissionId: formId,
                groupId: req.session.user.groupId
            })
            res.redirect('/capstone-projects');
        })
        .catch(err => console.log(err))
        }
}

exports.getApproveDocuments = (req, res) => {
    const role = req.session.user.role;
    const userGroup = req.session.user.groupId;
    const currentUser = req.session.user;
    SubmissionForm.findAll({
        include: [{
            model: Submission,
            as: 'submissions'
        }]
    })
    .then(forms => {
        res.render('activities/approve-documents', {
            forms: forms,
            userGroup: userGroup,
            role: role,
            currentUser: currentUser,
            status: forms.status
        });
    })
    .catch(err => console.log(err))
}


exports.getCreateForm = (req, res) => {
    const role = req.session.user.role;
    res.render('activities/create-form', {
        role: role
    })
}

exports.postCreateForm = (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const deadline = req.body.deadline;
    const email = req.session.email;
    const section = req.body.section;
    const role = req.session.user.role;
    User.findByPk(req.session.user.id)
        .then(user => {
            return SubmissionForm.create({
                title: title,
                description: description,
                deadline: deadline,
                createdBy: email,
                section: section,
                userId: user.id
            })
        })
        .then(result => {
            res.redirect('/activities/approve-documents');
        })
        .catch(err => console.log(err))
}


exports.getCapstoneProjects = (req, res) => {
    const role = req.session.user.role;
    const userGroup = req.session.user.groupId;
    SubmissionForm.findAll({
        include: [{
            model: Submission,
            as: 'submissions'
        }]
    })
    .then(forms => {
        res.render('capstone-projects', {
            userGroup: userGroup,
            forms: forms,
            role: role,
            status: forms.status,
        });
    })
    .catch(err => console.log(err))
};


  
  
  


exports.postCapstoneProjects = (req, res) => {
    
}

exports.getGroup = (req, res) => {
    const role = req.session.user.role;
    const hasGroup = req.session.user.groupId;
    const section = req.session.user.section;
    const user = req.session.user
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
            hasGroup: hasGroup,
            section: section,
            user: user
        })
    })
    .catch(err => console.log(err))    
};

exports.postGroup = (req, res) => {
    if (req.session.user.role === "Faculty") { //create group as a faculty
        const section = req.body.section;
        const name = req.body.name;
        Group.create({
            section: section,
            name: name
        })
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
                            User.findOne({ where: { id: userId } })
                            .then(user => {
                                user.update({ groupId: groupId })
                                req.session.user = user;
                                return user.save()
                            })
                            .then(member => {
                                res.redirect('/group');
                            })
                        }).catch(err => console.log(err))
                }
            })
        .catch(err => console.log(err))
    }
}
