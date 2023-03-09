const User = require('../models/user');

const Submission = require('../models/submission');
const SubmissionForm = require('../models/submissionForm');
const Group = require('../models/group');
const UserStudent = require('../models/userStudent');
const UserFaculty = require('../models/userFaculty');
const Status = require('../models/status');
const Comment = require('../models/comment');
const Batch = require('../models/batch');



exports.getHome = (req, res) => {
    const BatchPromise = Batch.findOne({ where: { isActive: true }});
    const role = req.session.user.role;
    const firstName = req.session.user.firstName;
    const lastName = req.session.user.lastName;
    const email = req.session.user.email;
    
    BatchPromise.then(activeBatch => {
      res.render('home', {
        role: role,
        firstName: firstName,
        lastName: lastName,
        email: email,
        batchName: activeBatch ? activeBatch.name : 'No active batch',
        isBatchActive: activeBatch && activeBatch.isActive ? true : false

      })
    })
    
    
};

exports.postBatch = (req, res) => {
  const name = req.body.name;
  const button = req.body.button;

  if(button == 'start') {
    Batch.create({ name: name, isActive: true })
    .then(batch => {
      console.log('new batch created')
      res.redirect('/faculty/home')
    })
    .catch(e => console.log(e))
  }
  if(button == 'stop') {
    Batch.findOne({ where: { isActive: true }}).then(activeBatch => {
      activeBatch.update({ isActive: false })
        .then(stoppedBatch => {
          res.redirect('/faculty/home')
        })
    })
    .catch(e => console.log(e))
  }
  
}

exports.getApproveDocuments = (req, res) => {
    const BatchPromise = Batch.findOne({ where: { isActive: true }}); 
    const role = req.session.user.role;
    const userGroup = req.session.user.groupId;
    const currentUser = req.session.user;
    const groupId = req.body.groupId

  BatchPromise.then(activeBatch => {
    Submission.findAll()
    .then(submissions => {
      const groupsPromises = submissions.map(submission => {
        return Group.findByPk(submission.groupId)
      })
      Promise.all(groupsPromises).then(groups => {
        res.render('faculty-activities/approve-documents', {
          submissions: submissions,
          userGroup: userGroup,
          role: role,
          currentUser: currentUser,
          groups: groups,
          activeBatchId: activeBatch ? activeBatch.id : 0
      });
      })
    })
    .catch(err => console.log(err))
  })
    
}

exports.postApproveDocuments = (req, res) => {
    const submissionId = req.body.submissionId;
    const roleChosen = req.body.roleChosen;
    UserFaculty.findOne({ where: { userId: req.session.user.id, role: roleChosen } })// palitan later to allow single users with multiple faculty roles
    .then(userFaculty => {
        const role = userFaculty.role;
        Status.findOne({ where: { userFacultyId: userFaculty.id, submissionId: submissionId }}) //You can only approve a document once per role
        .then(status => {
            if(status) {
                console.log('You have already approved this document');
                res.redirect(`/faculty/activities/view/${submissionId}`);
            } else {
                const status = req.body.statusChosen;
                console.log(submissionId + ' is the submission id');
                Status.create({ userFacultyId: userFaculty.id, submissionId: submissionId, status: status })
                  .then(() => {
                    //UPDATE SUBMISSION STATUS TO 'forRevision' OR TO 'approved'
                    Status.findAll({ where: { submissionId: submissionId } })
                      .then(statuses => {
                        let statusNum = 0;
                        let hasRevise = false;
                        statuses.forEach(status => {
                          if (status.status == 'revise') {
                            hasRevise = true;
                          }
                          if (status) {
                            statusNum++
                          }
                        }) 
                        console.log(statusNum + ' sdfsfdf')
                        if (statusNum === 5 && !hasRevise) {
                          Submission.findOne({ where: { id: submissionId }})
                            .then(submission => {
                              submission.update({ status: 'approved' })
                              console.log(submission.status + ' is the new status')
                            })
                          console.log('All 5 statuses are approved');
                        } else if (statusNum === 5 && hasRevise) {
                          Submission.findOne({ where: { id: submissionId }})
                            .then(submission => {
                              submission.update({ status: 'forRevision' })
                              console.log(submission.status + ' is the new status')
                            })
                          console.log('At least one of the 5 statuses is revise');
                        } else {
                          console.log(5 - statusNum + ' more need/s to approve');
                        }
                      })
                      .catch(err => console.log(err))
                    res.redirect(`/faculty/activities/view/${submissionId}`);
                  })

            }
        })
    })
    //UPDATE SUBMISSION STATUS TO 'forRevision' OR TO 'approved'
    Status.findAll({ where: { submissionId: submissionId } })
  .then(statuses => {
    let statusNum = 0;
    let hasRevise = false;
    statuses.forEach(status => {
      if (status.status == 'revise') {
        hasRevise = true;
      }
      if (status) {
        statusNum++
      }
    }) 
    console.log(statusNum + ' sdfsfdf')
    if (statusNum === 5 && !hasRevise) {
      Submission.findOne({ where: { id: submissionId }})
        .then(submission => {
          submission.update({ status: 'approved' })
          console.log(submission.status + ' is the new status')
        })
      console.log('All 5 statuses are approved');
    } else if (statusNum === 5 && hasRevise) {
      Submission.findOne({ where: { id: submissionId }})
        .then(submission => {
          submission.update({ status: 'forRevision' })
          console.log(submission.status + ' is the new status')
        })
      console.log('At least one of the 5 statuses is revise');
    } else {
      console.log(5 - statusNum + ' more need/s to approve');
    }
  })
  .catch(err => console.log(err))

}

exports.getView = (req, res) => {
    const role = req.session.user.role;
    const currentUser = req.session.user;
    Submission.findByPk(req.params.id)
      .then(submission => {
        if (!submission) {
            return res.redirect('/faculty/home')
        }
        const subGrpPromise = Group.findByPk(submission.groupId);
        
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
                Promise.all([Promise.all(statusPromises), Promise.all(commentPromises), subGrpPromise])
                  .then(([usersApprove, usersComment, subGrp]) => {

                    UserFaculty.findAll({ where: { userId: req.session.user.id }})
                      .then(faculty => {
                        const facultyId = faculty.map(user => {
                          return user.id
                        })
                        const rolesTaken = faculty.map(user => {
                          return user.role
                        })
                        const courseFaci = faculty
                          .filter(user => user.role === 'course-facilitator')
                          .map(user => user.section.toUpperCase())
                          .join(','); // concatenate the array elements with a comma delimiter
                        
                        const techAdvGroup = faculty
                          .filter(user => user.role === 'technical-adviser')
                          .map(user => user.id)
                        console.log(techAdvGroup);
                        console.log(subGrp.adviserId);

                            return res.render('view', {
                              submission: submission,
                              status: statuses,
                              comments: comments,
                              usersApprove: usersApprove,
                              usersComment: usersComment,
                              role: role,
                              rolesTaken: rolesTaken,
                              subGrp: subGrp,
                              section: courseFaci,
                              facultyId: facultyId,
                              currentUser: currentUser
                            });
                      })
                    
                  })
                  .catch(e => console.log(e));
              })
              .catch(e => console.log(e));
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  };
  
  
  
  
exports.postComment = (req, res) => {
    const comment = req.body.comment;
    const submissionId = req.body.submissionId;
    const submissionVersion = req.body.submissionVersion;
    UserFaculty.findOne({ where: { userId: req.session.user.id } })
    .then(faculty => {
        Comment.create({
            comment: comment,
            submissionId: submissionId,
            userFacultyId: faculty.id,
            forVersion: submissionVersion
        })
        res.redirect(`/faculty/activities/view/${submissionId}`);
    })
    .catch(e => console.log(e));
}
  
  

exports.getCreateForm = (req, res) => {
    const role = req.session.user.role;
    res.render('faculty-activities/create-form', {
        role: role
    })
}

exports.postCreateForm = (req, res) => {
    const BatchPromise = Batch.findOne({ where: { isActive: true }});
    const title = req.body.title;
    const description = req.body.description;
    const deadline = req.body.deadline;
    const email = req.session.email;
    const section = req.body.section;
    const role = req.session.user.role;
    BatchPromise.then(activeBatch => {
      UserFaculty.findOne({ where: { userId: req.session.user.id } })
        .then(user => {
            return SubmissionForm.create({
                title: title,
                description: description,
                deadline: deadline,
                createdBy: email,
                section: section,
                userId: user.id,
                batchId: activeBatch.id
            })
        })
        .then(result => {
            res.redirect('/faculty/activities/approve-documents');
        })
        .catch(err => console.log(err))
    })
    
}

exports.getRole = (req, res) => {
  const BatchPromise = Batch.findOne({ where: { isActive: true }});
    const role = req.session.user.role;

    UserFaculty.findAll()
      .then(faculties => {
        const facultyMembers = faculties.map(faculty => {
            return User.findByPk(faculty.userId);
        })
        Promise.all(facultyMembers)
        .then(members => {
              User.findAll({ where: { role: 'Faculty' } })
                .then(faculty => {
                  BatchPromise.then(activeBatch => {
                    res.render('faculty-activities/roles', {
                        role: role,
                        userFaculty: faculties,
                        facultyMembers: members,
                        faculty: faculty,
                        activeBatchId: activeBatch ? activeBatch.id : 0
                    });
                  })
                    
                })
              
          })
      })
    
}

exports.postRole = (req, res) => {
  const BatchPromise = Batch.findOne({ where: { isActive: true }});
    const roleChosen = req.body.role;
    const userEmail = req.body.email;
    const userId = req.body.userId;
    const sectionChosen = req.body.section;
    const groupId = req.body.groupId;
    const currentUser = req.session.user


  BatchPromise.then(activeBatch => {
    if (roleChosen === 'technical-adviser') {
      UserFaculty.create({ userId: currentUser.id, role: 'technical-adviser', section: 'all', batchId: activeBatch.id }, { returning: true })
        .then(createdFaculty => { 
          Group.findByPk(groupId)
            .then(group => {
              group.update({ adviserId: createdFaculty.id }) 
              res.redirect('/faculty/group')
            })
        })
    }
  })
    
  BatchPromise.then(activeBatch => {
    User.findOne({ where: { role: "Faculty", id: userId } })
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
                section: roleChosen === 'course-facilitator' ? sectionChosen : 'all',
                batchId: activeBatch.id
            })
            .then(result => {
                console.log('new user-faculty created with role: ' + roleChosen)
                res.redirect('/faculty/activities/roles');
            })
            }
        })
    })
    .catch(err => console.log(err));
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
  const BatchPromise = Batch.findOne({ where : { isActive: true }});
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
              BatchPromise.then(activeBatch => {
                res.render('group', {
                  groupId: role !== "Student" ? '' : student.groupId,
                  hasGroup: role !== "Student" ? '' : student.groupId,
                  section: role !== "Student" ? '' : student.section,
                  user: student,
                  group: groups,
                  members: groupMembers,
                  techAdv: techAdvNames,
                  role: role,
                  activeBatchId: activeBatch ? activeBatch.id : 0
                });
              });
          })
      })
      .catch(err => console.log(err));
    })
              
}
  
exports.postGroup = (req, res) => {
  const BatchPromise = Batch.findOne({ where: { isActive: true }});
        const section = req.body.section;
        const name = req.body.name;

        BatchPromise.then(activeBatch => {
          Group.create({
            section: section,
            name: name,
            batchId: activeBatch.id
        })
        .then(group => {
            console.log('new group created');
            res.redirect('/faculty/group');
        })
        .catch(err => console.log(err))
        })
        
}


