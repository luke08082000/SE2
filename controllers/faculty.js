const User = require('../models/user');

const Submission = require('../models/submission');
const SubmissionForm = require('../models/submissionForm');
const Group = require('../models/group');
const UserStudent = require('../models/userStudent');
const UserFaculty = require('../models/userFaculty');
const Status = require('../models/status');

exports.getHome = (req, res) => {
    const role = req.session.user.role;
    const firstName = req.session.user.firstName;
    const lastName = req.session.user.lastName;
    const email = req.session.user.email;
    
    res.render('home', {
        role: role,
        firstName: firstName,
        lastName: lastName,
        email: email
    })
};

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

exports.postApproveDocuments = (req, res) => {
    const submissionId = req.body.submissionId;
    UserFaculty.findOne({ where: { userId: req.session.user.id } })// palitan later to allow single users with multiple faculty roles
    .then(userFaculty => {
        const role = userFaculty.role;
        Status.findOne({ where: { userFacultyId: userFaculty.id, submissionId: submissionId }}) //You can only approve a document once per role
        .then(status => {
            if(status) {
                console.log('You have already approved this document');
                res.redirect('/faculty/activities/approve-documents');
            } else {
                const status = req.body.statusChosen;
                console.log(submissionId + ' is the submission id');
                Status.create({ userFacultyId: userFaculty.id, submissionId: submissionId, status: status })
                res.redirect('/faculty/activities/approve-documents');
            }
        }) 
    })
    //UPDATE SUBMISSION STATUS TO 'forRevision' OR TO 'approved'
    Status.findAll({ where: { submissionId: submissionId } })
    .then(statuses => {
        let approveNum = 0;
        statuses.forEach(status => {
            if(status.status == 'revise'){
                Submission.findOne({ where: { id: submissionId }})
                .then(submission => {
                submission.update({ status: 'forRevision' })
                console.log(submission.status + ' is the new status')
                return;
                })
            }
            if(status.status == 'approved') {
                approveNum++
                console.log(approveNum)
                if (approveNum === 5){            
                    Submission.findOne({ where: { id: submissionId }})
                    .then(submission => {
                        submission.update({ status: 'approved' })
                        console.log(submission.status + ' is the new status')
                    })
                    console.log(approveNum + ' approved');
                } else console.log(5 - approveNum + ' more need/s to approve');
            }
            
        })
        
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
            res.redirect('/faculty/activities/approve-documents');
        })
        .catch(err => console.log(err))
}

exports.getRole = (req, res) => {
    const role = req.session.user.role;
    res.render('faculty-activities/roles', {
        role: role
    });
}

exports.postRole = (req, res) => {
    const roleChosen = req.body.role;
    const userEmail = req.body.email;
    const sectionChosen = req.body.section;
    const groupId = req.body.groupId;
    const currentUser = req.session.user
    if (roleChosen === 'technical-adviser') {
        UserFaculty.findOne({ where: { userId: currentUser.id } })
          .then(userFaculty => {
            Group.findOne({ where: { id: groupId } })
              .then(group => {
                if (!group.adviserId) {
                  group.update({ adviserId: userFaculty.id })
                    .then(result => {
                      res.redirect('/faculty/group');
                    });
                } else {
                  console.log('The group already has a technical adviser')
                  res.redirect('/faculty/group');
                }
              });
          });
          return; // to exit the function early
      }
    User.findOne({ where: { role: "Faculty", email: userEmail } })
    .then(user => {
        UserFaculty.findAll()
        .then(userFaculties => {
            let roleTaken = false;
            userFaculties.forEach(userFaculty => {
            if(roleChosen === 'course-facilitator' && userFaculty.role === 'course-facilitator' && userFaculty.section === sectionChosen) {
                console.log('role is already taken by userFaculty: ' + userFaculty.userId)
                roleTaken = true;
            }
                const possibleRoles = ['course-department-chair', 'course-coordinator', 'track-head', 'technical-adviser'];
                if(userFaculty.role === roleChosen && possibleRoles.includes(roleChosen)) {
                    console.log('role is already taken by: ' + user.email)
                    roleTaken = true;
                }
            })
            if (roleTaken) {
            res.redirect('/faculty/home');
            } else {
            UserFaculty.create({ 
                userId: user.id,
                role: roleChosen,
                section: roleChosen === 'course-facilitator' ? sectionChosen : 'all'
            })
            .then(result => {
                console.log('new user-faculty created with role: ' + roleChosen)
                res.redirect('/faculty/activities/roles');
            })
            }
        })
    })
    .catch(err => console.log(err));
}

exports.getCapstoneProjects = (req, res) => {
    const role = req.session.user.role;
        Submission.findAll({ where: { status: 'approved' }})
        .then(submissions => {
            res.render('faculty-activities/capstone-projects', {
                role: role,
                submissions: submissions,
                status: submissions.status
            })
        })
        .catch(err => console.log(err))
};

exports.getGroup = (req, res) => {
    const role = req.session.user.role;
    UserStudent.findOne({ where: { userId: req.session.user.id } })
    .then(student => {
        Group.findAll({
            include: [{
                model: UserStudent
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
        const section = req.body.section;
        const name = req.body.name;
        Group.create({
            section: section,
            name: name
        })
        .then(group => {
            console.log('new group created');
            res.redirect('/faculty/group');
        })
        .catch(err => console.log(err))
}


