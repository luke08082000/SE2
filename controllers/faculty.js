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
    const AdminUserPromise = UserFaculty.findOne({ where: { userId: req.session.user.id, role: 'course-department-chair' } });
    const BatchPromise = Batch.findOne({ where: { isActive: true }});
    const role = req.session.user.role;
    const firstName = req.session.user.firstName;
    const lastName = req.session.user.lastName;
    const email = req.session.user.email;
    const verification = req.session.user.emailVerified;
    
      AdminUserPromise.then(admin => {
      BatchPromise.then(activeBatch => {
      res.render('home', {
        role: role,
        firstName: firstName,
        lastName: lastName,
        email: email,
        adminUser: (admin !== null) ? true : false,
        batchName: activeBatch ? activeBatch.name : 'No active batch',
        isBatchActive: activeBatch && activeBatch.isActive ? true : false,
        verification: verification


      })
    })
    })


    
    
};

exports.postBatch = (req, res) => {
  const name = req.body.name;
  const button = req.body.button;
  const adminPromise = UserFaculty.findOne({ where: { role: 'course-department-chair' }});

  if(button == 'start') {
    Batch.create({ name: name, isActive: true })
    .then(batch => {
      console.log('new batch created')
      Promise.all([adminPromise]).then(admin => { //updates admin's batchId 
        admin[0].update({ batchId: batch.id })
      })
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
    const FacultyPromise = UserFaculty.findAll({ where: { userId: req.session.user.id } });
    const role = req.session.user.role;
    const userGroup = req.session.user.groupId;
    const currentUser = req.session.user;
    const groupId = req.body.groupId

  BatchPromise.then(activeBatch => {
    FacultyPromise.then(faculty => {
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
            faculty: faculty,
            activeBatchId: activeBatch ? activeBatch.id : 0
        });
        })
      })
    })
    .catch(err => console.log(err))
  })
    
}

exports.postApproveDocuments = (req, res) => {
    const submissionId = req.body.submissionId;
    const roleChosen = req.body.roleChosen;
    const comment = req.body.comment;
    const submissionVersion = req.body.submissionVersion;
    const decision = req.body.decision;
    UserFaculty.findOne({ where: { userId: req.session.user.id, role: roleChosen } })// palitan later to allow single users with multiple faculty roles
    .then(userFaculty => {
      Comment.create({
        comment: comment,
        submissionId: submissionId,
        userFacultyId: userFaculty.id,
        forVersion: submissionVersion
      })
        const role = userFaculty.role;
        Status.findOne({ where: { userFacultyId: userFaculty.id, submissionId: submissionId }}) //You can only approve a document once per role
        .then(status => {
            if(status) {
                console.log('You have already approved this document');
                res.redirect(`/faculty/activities/view/${submissionId}`);
            } else {
              console.log(decision);
                const status = decision;
                console.log(submissionId + ' is the submission id');
                Status.create({ userFacultyId: userFaculty.id, submissionId: submissionId, status: status })
                  .then(() => {
                    //UPDATE SUBMISSION STATUS TO 'forRevision' OR TO 'approved'
                    Status.findAll({ where: { submissionId: submissionId } })
                      .then(statuses => {
                        let statusNum = 0;
                        let hasReject = false;
                        statuses.forEach(status => {
                          if (status.status == 'reject') {
                            hasReject = true;
                          }
                          if (status) {
                            statusNum++
                          }
                        }) 
                        console.log(statusNum + ' sdfsfdf')
                        if (statusNum === 5 && !hasReject) {
                          Submission.findOne({ where: { id: submissionId }})
                            .then(submission => {
                              submission.update({ status: 'approved' })
                              console.log(submission.status + ' is the new status')
                            })
                          console.log('All 5 statuses are approved');
                        } else if (statusNum === 5 && hasReject) {
                          Submission.findOne({ where: { id: submissionId }})
                            .then(submission => {
                              submission.update({ status: 'rejected' })
                              console.log(submission.status + ' is the new status')
                            })
                          console.log('At least one of the 5 statuses is reject');
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
    const BatchPromise = Batch.findOne({ where: { isActive: true }}); 
    Submission.findByPk(req.params.id)
      .then(submission => {
        if (!submission) {
            return res.redirect('/faculty/home')
        }
        // all revisions of submissions
        const revisionPromises = Submission.findAll({ where: { submissionId: submission.submissionId, groupId: submission.groupId, batchId: submission.batchId }});
        const subGrpPromise = Group.findByPk(submission.groupId); // Group referenced in submission
        const formPromise = SubmissionForm.findByPk(submission.submissionId); // Form referenced in submission
        
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
                Promise.all([Promise.all(statusPromises), Promise.all(commentPromises), revisionPromises, subGrpPromise, formPromise])
                  .then(([usersApprove, usersComment, revisions, subGrp, form]) => {
                    const highestVersionSubmission = revisions.reduce((highest, current) => {
                      if (current.version > highest.version) {
                        return current;
                      } else {
                        return highest;
                      }
                    })
                    UserFaculty.findAll({ where: { userId: req.session.user.id }})
                      .then(faculty => {
                        const facultyId = faculty.map(user => {
                          return user.id
                        })
                        const rolesTaken = faculty.map(user => {
                          return user.role
                        })
                        const facultyBatchId = faculty.map(user => {
                          return user.batchId
                        })
                        const courseFaci = faculty
                          .filter(user => user.role === 'course-facilitator')
                          .map(user => user.section)
                          .join(','); // concatenate the array elements with a comma delimiter
                        
                        const techAdvGroup = faculty
                          .filter(user => user.role === 'technical-adviser')
                          .map(user => user.id)
                        console.log(facultyBatchId);
                        
                        BatchPromise.then(activeBatch => {
                          return res.render('view', {
                              submission: submission,
                              form: form,
                              status: statuses,
                              comments: comments,
                              usersApprove: usersApprove,
                              usersComment: usersComment,
                              role: role,
                              rolesTaken: rolesTaken,
                              subGrp: subGrp,
                              section: courseFaci,
                              facultyId: facultyId,
                              currentUser: currentUser,
                              facultyBatchId: facultyBatchId,
                              activeBatchId: activeBatch ? activeBatch.id : 0,
                              revisions: revisions,
                              currentVersion: highestVersionSubmission
                            });
                        })
                            
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

    UserFaculty.findOne({ where: { userId: req.session.user.id, role: 'course-facilitator' }}).then(faculty => {
      if(faculty) {
        SubmissionForm.findAll({ where: { section: faculty.section }}).then(forms => {
          res.render('faculty-activities/create-form', {
          section: faculty.section,
          role: role,
          forms: forms ? forms : 0
          })
        })
      } else {
        res.redirect('/404');
      }
    })
}

exports.postCreateForm = (req, res) => {
    const BatchPromise = Batch.findOne({ where: { isActive: true }});
    const title = req.body.title;
    const description = req.body.description;
    const deadline = req.body.deadline;
    const email = req.session.email;
    const section = req.body.section;
    const needsApproval = Boolean(req.body.needsApproval) // if box is unchecked = undefined -> will be converted to false
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
                batchId: activeBatch.id,
                needsApproval: needsApproval
            })
        })
        .then(result => {
            res.redirect('/faculty/activities/create-form');
        })
        .catch(err => console.log(err))
    })
}

exports.getFormView = (req, res) => {
  const role = req.session.user.role;
  const formId = req.query.formId;
  console.log(formId)
  SubmissionForm.findByPk(formId).then(form => {
    console.log(formId + ' fdsfhsdhf')
    res.render('formView', { 
      role : role,
      form: form
    });
  })
}

exports.getRole = (req, res) => {
  // const isAdmin = UserFaculty.findOne({ where: { userId: req.session.user.id, role: 'course-department-chair' } });
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
                    // isAdmin.then(admin => {         // check if admin if not redirect to 404 page
                    //   if(admin) {
                        res.render('faculty-activities/roles', {
                        role: role,
                        userFaculty: faculties,
                        facultyMembers: members,
                        faculty: faculty
                        })
                      // } else {
                      //   res.redirect('/404');
                      // }
                    // })
                    
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
    const track = req.body.track;


    if (roleChosen === 'technical-adviser') {
      UserFaculty.create({ userId: currentUser.employee_id, role: 'technical-adviser', section: 'all'}, { returning: true })
        .then(createdFaculty => { 
          Group.findByPk(groupId)
            .then(group => {
              group.update({ adviserId: createdFaculty.id }) 
              res.redirect('/faculty/group')
            })
        })
    }
    
    User.findOne({ where: { role: "Faculty", employee_id: userId } })
    .then(user => {
        UserFaculty.findAll()
        .then(userFaculties => {
            let roleTaken = false;
            userFaculties.forEach(userFaculty => {
            if(roleChosen === 'course-facilitator' && userFaculty.role === 'course-facilitator' && userFaculty.section === sectionChosen) {
                console.log('role is already taken by userFaculty: ' + userFaculty.userId)
                roleTaken = true;
            }
            if(roleChosen === 'track-head' && userFaculty.role === 'track-head' && userFaculty.track === track) {
              console.log('role is already taken by userFaculty: ' + userFaculty.userId)
              roleTaken = true;
          }
                const possibleRoles = ['course-department-chair', 'course-coordinator', 'technical-adviser'];
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
                employee_id: userId,
                role: roleChosen,
                section: roleChosen === 'course-facilitator' ? sectionChosen : 'all',
                track: roleChosen === 'track-head' ? track : 'n/a'
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

exports.postRemove = (req, res) => {
  const facultyId = req.body.facultyId;
    UserFaculty.findByPk(facultyId).then(faculty => {
      faculty.destroy();
    })
    .then(result => {
      res.redirect('/faculty/activities/roles')
    })
    .catch(e => console.log(e))
}

exports.getCapstoneProjects = (req, res) => {
    const role = req.session.user.role;
        Group.findAll().then(groups => {
          const groupBatchPromise = groups.map(group => { //map batch for every group
            return Batch.findByPk(group.batchId)
          })
          const groupAdviserPromise = groups.map(group => {
             return UserFaculty.findByPk(group.adviserId).then(adviser => {
              if(adviser){
                return User.findByPk(adviser.userId);
              }
              })
          })
          Promise.all([Promise.all(groupBatchPromise), Promise.all(groupAdviserPromise)]).then(([groupBatch, groupAdviser]) => {
            res.render('faculty-activities/capstone-projects', {
                role: role,
                groups: groups,
                batch: groupBatch,
                adviser: groupAdviser
            })
          })
        })
        .catch(err => console.log(err))
};

exports.getArchiveView = (req, res) => {
  const role = req.session.user.role;
  const groupId = req.params.id;
  const currentStudent = UserStudent.findOne({ where: { userId: req.session.user.id }});

  Group.findByPk(groupId).then(group => {
   UserStudent.findAll({ where: { groupId: group.id } }).then(members => {
      const membersPromise = members.map(member => { //returns user info for every member
        return User.findByPk(member.userId)
      })
    const allMembers = UserStudent.findAll({ where: { groupId: group.id }});

      UserFaculty.findByPk(group.adviserId).then(adviser => { //returns info for adviser
        const adviserPromise = adviser?.userId ? User.findByPk(adviser.userId) : Promise.resolve(null);
        const submissionsPromise = Submission.findAll({ where: { groupId: group.id }});// returns all submissions from group

      allMembers.then(allMembers => {
        currentStudent.then(student => {
                Promise.all([Promise.all(membersPromise), submissionsPromise, adviserPromise]).then(([members, submissions, adviser]) => {
                    res.render('archiveView', {
                    role: role,
                    group: group,
                    members: members,
                    adviser: adviser ?? 'No adviser yet',
                    submissions: submissions,
                    student: student,
                    allMembers: allMembers
                    })
                })
          })
      })
     
          .catch(e => console.log(e))
        })
        .catch(e => console.log(e))
    })
    .catch(e => console.log(e))
  })
  .catch(e => console.log(e))
}

exports.getGroup = (req, res) => {
  const role = req.session.user.role;
  const BatchPromise = Batch.findOne({ where : { isActive: true }});
  const CourseFaci = UserFaculty.findOne({ where: { userId: req.session.user.id, role: 'course-facilitator'}});
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
                CourseFaci.then(faculty => {
                  res.render('group', {
                  groupId: role !== "Student" ? '' : student.groupId,
                  hasGroup: role !== "Student" ? '' : student.groupId,
                  section: role !== "Student" ? '' : student.section,
                  user: student,
                  group: groups,
                  members: groupMembers,
                  techAdv: techAdvNames,
                  faculty: faculty ? faculty : null,
                  role: role,
                  activeBatchId: activeBatch ? activeBatch.id : 0
                });
                })
                
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
        const track = req.body.track;

        BatchPromise.then(activeBatch => {
          Group.create({
            section: section,
            name: name,
            batchId: activeBatch.id,
            track: track
        })
        .then(group => {
            console.log('new group created');
            res.redirect('/faculty/group');
        })
        .catch(err => console.log(err))
        })
        
}


