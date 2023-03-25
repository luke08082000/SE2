const User = require('../models/user');
const Submission = require('../models/submission');
const SubmissionForm = require('../models/submissionForm');
const Group = require('../models/group');
const UserStudent = require('../models/userStudent');
const UserFaculty = require('../models/userFaculty');
const Status = require('../models/status');
const Comment = require('../models/comment');
const Batch = require('../models/batch');

const batchPromise = Batch.findOne({ where: { isActive: true }})

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

exports.getSubmit = (req, res) => { // should only output forms that the group have not yet submitted to
  const BatchPromise = Batch.findOne({ where: { isActive: true }}); 
    const role = req.session.user.role;
    const user = req.session.user;
    const section = req.session.user.section;
    UserStudent.findOne({ where: { userId: user.id } })
    .then(student => {
        SubmissionForm.findAll({ where: { section: student.section } }) // find all forms for the given section
        .then(forms => {
            if (!forms) {
                res.redirect('/student/home');
            }
            const formIds = forms.map(form => form.id);
            Submission.findAll({ where: { submissionId: formIds } }) // find all submissions for the given forms
            .then(submissions => {
                let submitted = false;
                console.log(submitted + " is submitted")

              BatchPromise.then(activeBatch => {
                res.render('student-activities/submit', {
                  submitted: submitted,
                  submissions: submissions,
                  student: student,
                  user: user,
                  forms: forms,
                  role: role,
                  section: student.section,
                  status: forms.status,
                  activeBatchId: activeBatch ? activeBatch.id : 0
              });
              })
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

        batchPromise.then(activeBatch => {
          UserStudent.findOne({ where : { userId: req.session.user.id }})
        .then(student => {
            SubmissionForm.findByPk(formId)
            .then(submission => {
                Submission.create ({ 
                    fileName: fileName,
                    filePath: filePath,
                    status: 'pending',
                    submittedBy: email,
                    userId: student.userId,
                    submissionId: formId,
                    groupId: student.groupId,
                    title: title,
                    version: 1,
                    batchId: activeBatch.id
                })
                res.redirect('/student/activities/monitor');
            })
        })
        .catch(err => console.log(err))
        })
        
        }
}

exports.getFormView = (req, res) => {
    const role = req.session.user.role;
    const formId = req.params.id;
    const user = req.session.user;
    console.log(formId);
    SubmissionForm.findByPk(formId)
      .then(form => {
        UserStudent.findOne({ where: { userId: user.id } })
        .then(student => {
        SubmissionForm.findAll({ where: { section: student.section } }) // find all forms for the given section
        .then(forms => {
            if (!forms) {
                res.redirect('/student/home');
            } else {
              res.render('formView', {
                  role: role,
                  form: form,
                  forms: forms
              })
            }
          })
        })
      })

}

exports.getMonitor = (req, res) => {
  const BatchPromise = Batch.findOne({ where : { isActive: true }});
    const role = req.session.user.role;
    UserStudent.findOne({ where: { userId: req.session.user.id } })
    .then(student => {
        Group.findOne({ where: { id: student.groupId } })
        .then(group => {
          if(!group) {
            return res.redirect('/404')
          }
            Submission.findAll({ where: { groupId: group.id }}) 
            .then(submissions => {
              if(!submissions) {
                return res.redirect('/404')
              }
                BatchPromise.then(activeBatch => {
                res.render('student-activities/monitor', {
                  student: student,
                  submissions: submissions,
                  role: role,
                  status: submissions.status,
                  capstoneTitle: group.capstoneTitle,
                  activeBatchId: activeBatch ? activeBatch.id : 0
              });
              })
            })
        })
    })
    .catch(err => console.log(err))
};

exports.getMonitorView = (req, res) => {
    const role = req.session.user.role;
    const submissionId = req.params.id;
    console.log(submissionId);
    Submission.findByPk(submissionId)
      .then(submission => {
        if (!submission) {
            return res.redirect('/student/activities/monitor')
        }
        const revisionPromises = Submission.findAll({ where: { submissionId: submission.submissionId, groupId: submission.groupId, batchId: submission.batchId }});
        const groupPromise = Group.findByPk(submission.groupId);
        const formPromise = SubmissionForm.findByPk(submission.submissionId);

        Status.findAll({ where: { submissionId: submission.id } })
          .then(statuses => {
            const statusPromises = statuses.map(status => {
              return UserFaculty.findOne({ where: { id: status.userFacultyId }, include:  User })
            });
  
            Comment.findAll({ where: { submissionId: submission.id }})
              .then(comments => {
                const commentPromises = comments.map(comment => {
                  return UserFaculty.findOne({ where: { id: comment.userFacultyId }, include:  User })
                })
  
                Promise.all([Promise.all(statusPromises), Promise.all(commentPromises), revisionPromises, groupPromise, formPromise])
                  .then(([usersApprove, usersComment, revisions, group, form]) => {
                    //console.log(JSON.stringify(usersApprove, null, 2));
                    //console.log('User commented ' + JSON.stringify(usersComment, null, 2));
                    return res.render('view', {
                      submission: submission,
                      form: form,
                      status: statuses,
                      comments: comments,
                      usersApprove: usersApprove,
                      usersComment: usersComment,
                      role: role,
                      revisions: revisions,
                      group: group
                    });
                  })
                  .catch(e => console.log(e));
              })
              .catch(e => console.log(e));
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
}

exports.getRevise = (req, res) => {
    const role = req.session.user.role;
    UserStudent.findOne({ where: { userId: req.session.user.id } })
    .then(student => {
        Group.findOne({ where: { id: student.groupId } })
        .then(group => {
            Submission.findAll({ where: { groupId: group.id, status: 'forRevision' }}) 
            .then(submissions => {
                res.render('student-activities/revise', {
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

exports.postRevise = (req, res) => {
    const filePath = req.file.path.substring(6) // to exclude public folder
    const fileName = req.file.filename;
    const submissionFormId = req.body.submissionFormId;
    const submissionGroupId = req.body.submissionGroupId;
    const submissionTitle = req.body.submissionTitle;
    const submissionBatchId = req.body.submissionBatchId;
        Submission.findAll({ where: { submissionId: submissionFormId, groupId: submissionGroupId } })
        .then(submissions => {
      // Find the submission with the highest version number
          const highestVersionSubmission = submissions.reduce((highest, current) => {
            if (current.version > highest.version) {
              return current;
            } else {
              return highest;
            }
          });
      // Create a new submission with the same properties as the highest version submission, except with version incremented by 1
      return Submission.create({
        submittedBy: req.session.user.email,
        title: submissionTitle,
        submissionId: submissionFormId,
        groupId: submissionGroupId,
        status: 'revised',
        filePath: filePath,
        fileName: fileName,
        version: highestVersionSubmission.version + 1,
        batchId: submissionBatchId
      });
    
  })
  .then(newSubmission => {
      return Submission.findOne({ where: { submissionId: newSubmission.submissionId, groupId: newSubmission.groupId, batchId: newSubmission.batchId, version: 1 }})
        .then(oldSubmission => {
          oldSubmission.update({
            status: 'revised'
          })
        })
        .then(result => res.redirect('/student/activities/monitor'));
  })
  .catch(error => {
    console.log(error)
  });
}



exports.getProjectMilestones = (req, res) => {
    const role = req.session.user.role;
    if(role == 'Student') {
        UserStudent.findOne({ where: { userId: req.session.user.id } })
        .then(student => {
            Group.findOne({ where: { id: student.groupId } })
            .then(group => {
                Submission.findAll({ where: { groupId: group.id, status: 'approved' }}) // reminder: lagyan ng title ung submission model
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
    }
};

exports.getGroup = (req, res) => {
  const BatchPromise = Batch.findOne({ where : { isActive: true }});
  const studentPromise = UserStudent.findByPk(req.session.user.id);
  const role = req.session.user.role;
  UserStudent.findOne({ where: { userId: req.session.user.id } })
    .then(student => {
      return Group.findAll()
        .then(groups => {
          const techAdvPromises = groups.map(group => {
            return UserFaculty.findByPk(group.adviserId)
              .then(faculty => {
                if (faculty) {
                  return User.findByPk(faculty.userId)
                    .then(user => {
                      return user.firstName + ' ' + user.lastName
                    })
                }
              })
          })
          const groupMembers = groups.map(group => {
            return UserStudent.findAll({ where: { groupId: group.id }})
              .then(students => {
                if (students.length) {
                  const memberNames = students.map(student => {
                    return User.findByPk(student.userId)
                      .then(user => {
                        return user.firstName + ' ' + user.lastName
                      })
                  });
                  return Promise.all(memberNames);
                }
              })
          });
          

          // Wait for all promises to resolve
          Promise.all([...techAdvPromises, ...groupMembers])
            .then(results => {
              // Split results into techAdvNames and groupMembers
              const techAdvNames = results.slice(0, groups.length);
              const groupMembers = results.slice(groups.length);

            studentPromise.then(studentUser => {
              BatchPromise.then(activeBatch => {
              res.render('group', {
                groupId: role !== "Student" ? '' : student.groupId,
                hasGroup: role !== "Student" ? '' : student.groupId,
                section: role !== "Student" ? '' : student.section,
                user: student,
                student: studentUser,
                group: groups,
                members: groupMembers,
                techAdv: techAdvNames,
                role: role,
                activeBatchId: activeBatch ? activeBatch.id : 0
              });
            })
            })
            
              
            });
        })
    })
    .catch(err => console.log(err));
}


exports.postGroup = (req, res) => {
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
                res.redirect('/student/group');
            }
        })
    .catch(err => console.log(err))
}

exports.postTitle = (req, res) => {
  const title = req.body.title;
  const groupId = req.body.groupId;
  Group.findByPk(groupId)
    .then(group => {
      group.update({ capstoneTitle: title})
      return group.save()
    })
    .then(result => {
      res.redirect('/student/group');
    })
    .catch(e => console.log(e));
}
