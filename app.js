const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./util/database');
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const multer = require('multer');

//MODELS
const User = require('./models/user');
const UserStudent = require('./models/userStudent');
const UserFaculty = require('./models/userFaculty');
const Submission = require('./models/submission');
const SubmissionForm = require('./models/submissionForm');
const Group = require('./models/group');
const Status = require('./models/status');
const Comment = require('./models/comment');
const Batch = require('./models/batch');

//ROUTES
const authRoutes = require('./routes/auth');
const facultyRoutes = require('./routes/faculty');
const studentRoutes = require('./routes/student');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/pdf-files');
    },
    filename: (req, file, cb) => {
        const date = new Date().toISOString().replace(/:/g, '-');
        const newFilename = `${date}-${file.originalname}`;
        cb(null, newFilename);
    }
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage}).single('file'));
app.use(express.static(path.join(__dirname, 'public')));

const mysqlOptions
 = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'pass123',
    database: 'crsa',
    schema: {
		tableName: 'sessions',
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
    }
}
const connection = mysql.createPool(mysqlOptions);
const sessionStore = new MySQLStore({}, connection)

app.set('view engine', 'ejs');
app.set('views', 'views');



app.use(session({
    key: 'cookieMonster',
    secret: 'my secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}));

app.use((req, res, next) => {
    console.log(req.session.isLoggedIn)
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
})

//RELATIONSHIPS

// User.hasMany(SubmissionForm, { foreignKey: 'userId' });
// SubmissionForm.belongsTo(User, { foreignKey: 'userId' });

// User.hasMany(Submission, { foreignKey: 'userId' });
// Submission.belongsTo(User, { foreignKey: 'userId' });

Batch.hasMany(UserFaculty, { foreignKey: 'batchId'});
UserFaculty.belongsTo(Batch, { foreignKey: 'batchId'});

Batch.hasMany(UserStudent, { foreignKey: 'batchId'});
UserStudent.belongsTo(Batch, { foreignKey: 'batchId'});

Batch.hasMany(Group, { foreignKey: 'batchId'});
Group.belongsTo(Batch, { foreignKey: 'batchId'});

Batch.hasMany(Submission, { foreignKey: 'batchId'});
Submission.belongsTo(Batch, { foreignKey: 'batchId'});

Batch.hasMany(SubmissionForm, { foreignKey: 'batchId' });
SubmissionForm.belongsTo(Batch, { foreignKey: 'batchId'});

SubmissionForm.hasMany(Submission, { foreignKey: 'submissionId' }); // ID nung submissionForm
Submission.belongsTo(SubmissionForm, { foreignKey: 'submissionId' }); // submissionFormId

//User to student relationship
User.hasOne(UserStudent, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserStudent.belongsTo(User, { foreignKey: 'userId' });
//User to faculty relationship
User.hasOne(UserFaculty, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserFaculty.belongsTo(User, { foreignKey: 'userId' });
//Student to group relationship
UserStudent.belongsTo(Group);
Group.hasMany(UserStudent, { foreignKey: 'groupId'});
//Submission to group relationship = one to many
Group.hasMany(Submission, { foreignKey: 'groupId' });
Submission.belongsTo(Group, { foreignKey: 'groupId' });
//UserFaculty to group = one to many
UserFaculty.hasMany(Group, { foreignKey: 'adviserId' }); //adviserId is userfaculty id
Group.belongsTo(UserFaculty, { foreignKey: 'adviserId' });
//Submission to Status = many to many
Submission.hasMany(Status, { foreignKey: 'submissionId' });
Status.belongsToMany(Submission, { through: 'SubmissionStatus' });
//UserFaculty to Status = one to many
UserFaculty.hasMany(Status, { foreignKey: 'userFacultyId' });
Status.belongsTo(UserFaculty, { foreignKey: 'userFacultyId' });
//UserFaculty to Comment = one to many
UserFaculty.hasMany(Comment, { foreignKey: 'userFacultyId' });
Comment.belongsTo(UserFaculty, { foreignKey: 'userFacultyId' });

//ROUTES
app.use(authRoutes);
function handleRoutes(req, res, next) {
    if (req.session.user.role === "Student") {
        app.use('/student', studentRoutes);
    }
    if (req.session.user.role === "Faculty") {
        app.use('/faculty', facultyRoutes);
    }
    next();
}
app.use(handleRoutes);



sequelize
.sync()
.then(result => {
    app.listen(3000);
})
.catch(err => console.log(err))
