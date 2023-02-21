const User = require('../models/user');

const Submission = require('../models/submission');
const SubmissionForm = require('../models/submissionForm');
const Group = require('../models/group');
const UserStudent = require('../models/userStudent');
const UserFaculty = require('../models/userFaculty');

exports.getHome = (req, res) => {
    const role = req.session.user.role;
    const firstName = req.session.user.firstName;
    const lastName = req.session.user.lastName;
    const email = req.session.user.email;
 
    UserStudent.findOne({ where: { userId: req.session.user.id } })
    .then(student => {
        res.render('home', {
            role: role,
            firstName: firstName,
            lastName: lastName,
            email: email
        })
    })
};

exports.getSubmit = (req, res) => { // should only output forms that the group have not yet submitted to
    const role = req.session.user.role;
    const user = req.session.user;
    const section = req.session.user.section;
    UserStudent.findOne({ where: { userId: user.id } })
    .then(student => {
        SubmissionForm.findAll({ where: { section: student.section } }) // find all forms for the given section
        .then(forms => {
            if (!forms) {
                res.redirect('/home');
            }
            const formIds = forms.map(form => form.id);
            Submission.findAll({ where: { submissionId: formIds } }) // find all submissions for the given forms
            .then(submissions => {
                let submitted = false;
                console.log(submitted + " is submitted")
                res.render('student-activities/submit', {
                    submitted: submitted,
                    submissions: submissions,
                    student: student,
                    user: user,
                    forms: forms,
                    role: role,
                    section: student.section,
                    status: forms.status
                });
            })
            
        })
    })
};
  
exports.postSubmit = (req, res) => {
    const role = req.session.user.role;
    if (role === "Student") {
        const filePath = req.file.path.substring(6) // to exclude public folder
        const fileName = req.file.filename;
        const formId = req.body.formId;
        const title = req.body.formTitle;
        const email = req.session.user.email;
        UserStudent.findOne({ where : { userId: req.session.user.id }})
        .then(student => {
            SubmissionForm.findByPk(formId)
            .then(submission => {
                Submission.create ({ 
                    fileName: fileName,
                    filePath: filePath,
                    status: 'Pending',
                    submittedBy: email,
                    userId: student.userId,
                    submissionId: formId,
                    groupId: student.groupId,
                    title: title
                })
                res.redirect('/activities/monitor');
            })
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
        res.render('faculty-activities/approve-documents', {
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
    res.render('faculty-activities/create-form', {
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
    UserFaculty.findOne({ where: { userId: req.session.user.id } })
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


exports.getMonitor = (req, res) => {
    const role = req.session.user.role;
    UserStudent.findOne({ where: { userId: req.session.user.id } })
    .then(student => {
        Group.findOne({ where: { id: student.groupId } })
        .then(group => {
            Submission.findAll({ where: { groupId: group.id }}) // lagyan ng title ung submission model
            .then(submissions => {
                res.render('student-activities/monitor', {
                    student: student,
                    submissions: submissions,
                    role: role,
                    status: submissions.status,
                });
            })
        })
    })
    .catch(err => console.log(err))
};

exports.getCapstoneProjects = (req, res) => {
    const role = req.session.user.role;
    UserStudent.findOne({ where: { userId: req.session.user.id } })
    .then(student => {
        Group.findOne({ where: { id: student.groupId } })
        .then(group => {
            Submission.findAll({ where: { groupId: group.id }}) // lagyan ng title ung submission model
            .then(submissions => {
                res.render('capstone-projects', {
                    student: student,
                    submissions: submissions,
                    role: role,
                    status: submissions.status,
                });
            })
        })
    })
    .catch(err => console.log(err))
};

  


exports.postCapstoneProjects = (req, res) => {
    
}

exports.getGroup = (req, res) => {
    const role = req.session.user.role;
    UserStudent.findOne({ where: { userId: req.session.user.id } })
    .then(student => {
        Group.findAll({
            include: [{
                model: User,
                through: UserStudent
            }]
        })
        .then(groups => {
            res.render('group', {
                groupId: role !== "Student" ? '' : student.groupId,
                hasGroup: role !== "Student" ? '' : student.groupId,
                section: role !== "Student" ? '' : student.section,
                user: student,
                group: groups,
                role: role
            });
        })
    })
    .catch(err => console.log(err));
}




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
        UserStudent.findOne({ where: { userId: userId } }) //find current userStudent
            .then(student => {
                if(student.groupId) { //if student has groupId 
                    console.log('May Group ka na!')
                    res.redirect('/group');
                } else {
                    student.update({ groupId: groupId }) //update student groupId
                    student.save();
                    res.redirect('/group');
                }
            })
        .catch(err => console.log(err))
    }
}


