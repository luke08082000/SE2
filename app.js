const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

const studentRoutes = require('./routes/student');
const academicStaffRoutes = require('./routes/academic-staff');

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register')
});

//student routes
app.use('/student', studentRoutes);

//staff routes
app.use('/academic-staff', academicStaffRoutes);

app.listen(3000);