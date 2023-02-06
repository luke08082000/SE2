const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./util/database');
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const multer = require('multer');

const User = require('./models/user');
const Submission = require('./models/submission');

const authRoutes = require('./routes/auth');

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

const navRoutes = require('./routes/nav');

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

User.hasMany(Submission);
Submission.hasOne(User);
app.get('/view-pdf', (req, res) => {
    res.render('pdf');
})
app.use(authRoutes);

//nav routes
app.use(navRoutes);


//User.create({
//    firstName: 'test',
//    lastName: 'test',
//    email: 'test@test',
//    password: 'test'
//});


sequelize
.sync()
.then(result => {
    app.listen(3000);
})
.catch(err => console.log(err))
